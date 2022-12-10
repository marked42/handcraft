function main() {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
        return;
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // window.addEventListener("load", () => {
    //     canvas.width = canvas.offsetWidth;
    //     canvas.height = canvas.offsetHeight;
    // });

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    const brushWidth = 5;

    const fillColor = document.querySelector<HTMLInputElement>("#fill-color");
    let selectedTool = "brush";
    let isDrawing = false;
    // rectangle start point
    let startEvent: MouseEvent | null = null;
    // snapshot for incremental rectangle
    let snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const startDraw = (e: MouseEvent) => {
        isDrawing = true;
        ctx.beginPath();
        startEvent = e;
        ctx.lineWidth = brushWidth;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    const stopDraw = () => {
        isDrawing = false;
    };
    const drawRectangle = (e: MouseEvent) => {
        if (startEvent) {
            const rect = [
                e.offsetX,
                e.offsetY,
                startEvent?.offsetX - e.offsetX,
                startEvent?.offsetY - e.offsetY,
            ] as const;
            if (fillColor?.checked) {
                ctx.fillRect(...rect);
            } else {
                ctx.strokeRect(...rect);
            }
        }
    };

    const drawing = (e: MouseEvent) => {
        if (!isDrawing) {
            return;
        }
        // retore
        ctx.putImageData(snapshot, 0, 0);

        console.log("tool: ", selectedTool);
        if (selectedTool === "brush") {
            console.log("mouse e: ", e);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        } else if (selectedTool === "rectangle") {
            drawRectangle(e);
        }
    };

    canvas.addEventListener("mousemove", drawing);
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mouseup", stopDraw);

    const toolButtons = document.querySelectorAll(".tool");
    toolButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // set active button
            document
                .querySelector(".options .active")
                ?.classList.remove("active");

            button.classList.add("active");

            selectedTool = button.id;
        });
    });
}

main();
