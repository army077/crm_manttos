import React from "react";
import {
    useDraggable,
    DragOverlay,
    type UseDraggableArguments,
} from "@dnd-kit/core";

interface Props {
    id: string;
    data?: UseDraggableArguments["data"];
}

export const DraggableKanbanItem = ({
    children,
    id,
    data,
}: React.PropsWithChildren<Props>) => {
    const { attributes, listeners, setNodeRef, active } = useDraggable({
        id,
        data,
    });

    return (
        <div style={{ position: "relative" }}>
            <div
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                style={{
                    opacity: active?.id === id ? 0.5 : 1,
                    cursor: "grab",
                }}
            >
                {children}
            </div>
            {active?.id === id && (
                <DragOverlay>
                    <div style={{ cursor: "grabbing" }}>{children}</div>
                </DragOverlay>
            )}
        </div>
    );
};