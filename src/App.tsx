import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import View from "./View";
import { useAppHook } from "./hooks/app/app.hook";

function App() {
  const { theme, queryClient } = useAppHook();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <View />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
