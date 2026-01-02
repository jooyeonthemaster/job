'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableGridSlotProps {
    id: string;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    // 기존 button props 전달용
    [key: string]: any;
}

export function SortableGridSlot({
    id,
    children,
    disabled,
    className,
    style,
    ...props
}: SortableGridSlotProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        disabled,
    });

    const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // 드래그 중인 원본 요소 투명도 처리
        ...style,
    };

    return (
        <div
            ref={setNodeRef}
            style={dndStyle}
            className={className}
            {...attributes}
            {...listeners}
            {...props}
        >
            {children}
        </div>
    );
}
