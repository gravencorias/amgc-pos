package com.amgc.pos;

import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // The app's own plugin (Bluetooth receipt printing); npm plugins register themselves.
        registerPlugin(ReceiptPrinterPlugin.class);
        super.onCreate(savedInstanceState);

        // A register stays on all day: don't let the screen sleep while the app is open.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
