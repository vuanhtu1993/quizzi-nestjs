## Thực hành Debug trong dự án NestJS (Practice)
NestJS thường được viết bằng ngôn ngữ **TypeScript**. Bạn không thể chạy trực tiếp TypeScript trên Node.js mà phải biên dịch nó ra tệp tin JavaScript (thường nằm ở thư mục `dist`). 
Vấn đề nảy sinh: **Khi gỡ lỗi, chúng ta đặt dấu Breakpoint ở file `.ts`, nhưng code thực thi lại là file `.js`. Làm sao VSCode hiểu được?**
👉 Cầu nối chính là khái niệm **`sourceMaps`**.
Cấu hình `launch.json` cho dự án NestJS (bỏ qua bước chạy tay `npm run start:debug` nhọc nhằn):
```json
// filename: .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "🚀 Launch & Debug NestJS",
      "cwd": "${workspaceFolder}/quizzi-nest",
      "runtimeExecutable": "npm",
      "runtimeArgs": [
        "run",
        "start:debug"
      ],
      "restart": true,
      "console": "integratedTerminal",
      "autoAttachChildProcesses": true
    },
    {
      "type": "node",
      "request": "attach",
      "name": "🔌 Attach to NestJS (Port 9229)",
      "address": "127.0.0.1",
      "port": 9229,
      "restart": true,
      "cwd": "${workspaceFolder}/quizzi-nest",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "outFiles": [
        "${workspaceFolder}/**/*.js"
      ]
    }
  ]
}
```
Chỉ cần chọn "Debug NestJS Application" bên tab **Run and Debug** (`Cmd + Shift + D`) và bấm phím **F5**. Toàn bộ server sẽ khởi chạy và các Breakpoints trong file `.ts` của bạn đã sẵn sàng bắt dính lỗi.