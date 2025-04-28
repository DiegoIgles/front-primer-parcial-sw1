// import React, { useEffect, useRef } from "react";
// import { fabric } from "fabric";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:4000");

// const UI = () => {
//   const canvasRef = useRef(null);
//   const rectRef = useRef(null);
//   const isUpdatingFromSocket = useRef(false); // ⚡ Bloquea actualizaciones en bucle

//   useEffect(() => {
//     const canvas = new fabric.Canvas(canvasRef.current, {
//       width: 800,
//       height: 500,
//       backgroundColor: "white",
//     });
  
//     const rect = new fabric.Rect({
//       left: 100,
//       top: 100,
//       fill: "red",
//       width: 100,
//       height: 100,
//       selectable: true,
//       hasControls: true,
//     });
  
//     rectRef.current = rect;
//     canvas.add(rect);
  
//     // 📌 Escuchar actualizaciones de otros clientes
//     socket.on("updatePosition", (data) => {
//       if (rectRef.current) {
//         isUpdatingFromSocket.current = true;
//         rectRef.current.set({ left: data.left, top: data.top });
//         rectRef.current.setCoords();
//         canvas.renderAll();
  
//         setTimeout(() => {
//           isUpdatingFromSocket.current = false;
//         }, 50);
//       }
//     });
  
//     // 📌 Evento cuando el usuario mueve el rectángulo
//     rect.on("moving", () => {
//       if (!isUpdatingFromSocket.current) {
//         const { left, top } = rect;
//         socket.emit("moveRect", { left, top });
//       }
//     });
  
//     // 👁️ Detectar si el usuario regresa a la pestaña
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         socket.emit("getPosition"); // Solicitar posición actual
//       }
//     };
  
//     document.addEventListener("visibilitychange", handleVisibilityChange);
  
//     // 🧹 Cleanup
//     return () => {
//       socket.off("updatePosition");
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       canvas.dispose();
//     };
//   }, []);
  

//   return (
//     <div>
//       <h1>Editor de Diagramas 🎨</h1>
//       <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
//     </div>
//   );
// };

// export default UI;
