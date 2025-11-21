import React from "react";
import { ChatTrigger, useTheme } from "@tandem/ui-kit";
import { WidgetIcon } from "./WidgetIcon";

interface FloatingChatTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  showNotification?: boolean;
}

export function FloatingChatTrigger({ onClick, showNotification, className, ...rest }: FloatingChatTriggerProps) {
  const { theme } = useTheme();
  const iconName = (theme as any).widgetIcon ?? "Amber-Rise";

  return (
    <ChatTrigger
      onClick={onClick}
      showNotification={showNotification}
      iconName={iconName}
      className={className}
      {...rest}
      renderIcon={() => (
<<<<<<< HEAD
        <WidgetIcon
          name={iconName as any}
          className="h-20 w-20 rounded-full shadow-xl"
        />
=======
        <WidgetIcon name={iconName as any} className="h-16 w-16" />
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
      )}
    />
  );
}
