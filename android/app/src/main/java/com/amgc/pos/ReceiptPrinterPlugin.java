package com.amgc.pos;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.util.UUID;

// Sends raw ESC/POS bytes to a paired Bluetooth receipt printer over classic Bluetooth serial
// (SPP), which the common 58 mm and 80 mm printers use (PT-210, Xprinter, GOOJPRT, Rongta).
// The web app builds the bytes (src/utils/escpos.ts); this only lists printers and sends.
// Pairing happens once in Android's own Bluetooth settings.
@CapacitorPlugin(
    name = "ReceiptPrinter",
    permissions = { @Permission(alias = "bluetooth", strings = { Manifest.permission.BLUETOOTH_CONNECT }) }
)
public class ReceiptPrinterPlugin extends Plugin {

    // The standard Serial Port Profile id.
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    // Android 12+ asks for "Nearby devices" at run time; older versions grant it at install.
    private boolean needsPermission() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && getPermissionState("bluetooth") != PermissionState.GRANTED;
    }

    private BluetoothAdapter adapter() {
        BluetoothManager manager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        return manager == null ? null : manager.getAdapter();
    }

    @PluginMethod
    public void listPrinters(PluginCall call) {
        if (needsPermission()) {
            requestPermissionForAlias("bluetooth", call, "listPrintersAfterPermission");
            return;
        }
        listPaired(call);
    }

    @PermissionCallback
    private void listPrintersAfterPermission(PluginCall call) {
        if (needsPermission()) {
            call.reject("Allow \"Nearby devices\" for AMGC POS to use a Bluetooth printer.", "PERMISSION_DENIED");
            return;
        }
        listPaired(call);
    }

    @SuppressLint("MissingPermission")
    private void listPaired(PluginCall call) {
        BluetoothAdapter adapter = adapter();
        if (adapter == null) {
            call.reject("This device has no Bluetooth.", "NO_BLUETOOTH");
            return;
        }
        if (!adapter.isEnabled()) {
            call.reject("Turn on Bluetooth, then try again.", "BLUETOOTH_OFF");
            return;
        }

        JSArray printers = new JSArray();
        for (BluetoothDevice device : adapter.getBondedDevices()) {
            JSObject item = new JSObject();
            item.put("name", device.getName() == null ? device.getAddress() : device.getName());
            item.put("address", device.getAddress());
            // Imaging devices (printers) first in the list; the app still shows every paired device,
            // since many cheap printers report no class at all.
            BluetoothClass type = device.getBluetoothClass();
            item.put("isPrinter", type != null && type.getMajorDeviceClass() == BluetoothClass.Device.Major.IMAGING);
            printers.put(item);
        }

        JSObject result = new JSObject();
        result.put("printers", printers);
        call.resolve(result);
    }

    @PluginMethod
    public void print(PluginCall call) {
        if (needsPermission()) {
            requestPermissionForAlias("bluetooth", call, "printAfterPermission");
            return;
        }
        send(call);
    }

    @PermissionCallback
    private void printAfterPermission(PluginCall call) {
        if (needsPermission()) {
            call.reject("Allow \"Nearby devices\" for AMGC POS to use a Bluetooth printer.", "PERMISSION_DENIED");
            return;
        }
        send(call);
    }

    private void send(PluginCall call) {
        String address = call.getString("address");
        String data = call.getString("data");
        if (address == null || data == null) {
            call.reject("Choose a printer first.", "NO_PRINTER");
            return;
        }

        BluetoothAdapter adapter = adapter();
        if (adapter == null || !adapter.isEnabled()) {
            call.reject("Turn on Bluetooth, then try again.", "BLUETOOTH_OFF");
            return;
        }

        byte[] bytes = Base64.decode(data, Base64.DEFAULT);
        // Off the main thread: connecting can take a few seconds.
        new Thread(() -> {
            try {
                write(adapter, address, bytes);
                call.resolve();
            } catch (Exception e) {
                call.reject("The printer didn't answer. Check that it's on, charged and near this tablet.", "PRINT_FAILED", e);
            }
        }).start();
    }

    @SuppressLint("MissingPermission")
    private void write(BluetoothAdapter adapter, String address, byte[] bytes) throws IOException, InterruptedException {
        BluetoothDevice device = adapter.getRemoteDevice(address);
        adapter.cancelDiscovery();

        BluetoothSocket socket;
        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
        } catch (IOException secureFailed) {
            // Some printers only accept an insecure (unauthenticated) connection.
            socket = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
        }

        try {
            OutputStream out = socket.getOutputStream();
            // In chunks: small printers drop data when their buffer overflows.
            int chunk = 512;
            for (int offset = 0; offset < bytes.length; offset += chunk) {
                out.write(bytes, offset, Math.min(chunk, bytes.length - offset));
                out.flush();
                Thread.sleep(20);
            }
            // Let the printer take the last bytes before the connection closes.
            Thread.sleep(300);
        } finally {
            socket.close();
        }
    }
}
