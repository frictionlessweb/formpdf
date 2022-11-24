/** @jsxImportSource @emotion/react */

import React from "react";
import color from "./color";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ANNOTATION_TYPE, fieldTypes } from "../app/StoreProvider";
import TextField from "@mui/material/TextField";

const NO_OP = () => {};

interface ContainerProps {
  // Other components to render inside the Container div.
  children?: React.ReactNode;
  position: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({ children, position }) => {
  return (
    <div
      css={{
        transform: "translateY(calc(-100% - 12px))",
        position: "absolute",
        ...position,
        width: "auto",
        height: "2.5rem",
        zIndex: 500,
        background: "white",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
      }}>
      {children}
    </div>
  );
};

interface ActionMenuItemProps {
  children?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = (props) => {
  const { children, onClick, onMouseDown } = props;
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // We have to prevent the default behaviour for
    // the pdf canvas here, in order to be able to capture
    // the click event.
    onClick(e);
    e.stopPropagation();
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onMouseDown(e);
    e.stopPropagation();
  };
  return (
    <span
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      css={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.25rem 0.75rem",
        fontSize: "0.875rem",
        fontFamily: "Roboto, sans-serif",
        fontWeight: 700,
        borderRight: `1px solid ${color.gray.line}`,
        img: {
          width: "100%",
          height: "100%",
          maxWidth: "1rem",
          maxHeight: "1.125rem",
        },
        "&:lastOfType": {
          borderRight: "none",
        },
        "&:hover": {
          background: color.gray.line,
          cursor: "pointer",
          borderRadius: "0.5rem",
        },
      }}>
      {children}
    </span>
  );
};

interface FieldLayerActionMenuProps {
  position: React.CSSProperties;
  value: ANNOTATION_TYPE;
  onDelete: () => void;
  onFieldTypeChange: (value: ANNOTATION_TYPE) => void;
}

export const FieldLayerActionMenu: React.FC<FieldLayerActionMenuProps> = (
  props
) => {
  const { value, onDelete, onFieldTypeChange, position } = props;
  return (
    <Container position={position}>
      <Select
        value={value}
        onChange={(e) => onFieldTypeChange(e.target.value as ANNOTATION_TYPE)}
        css={{ height: "40px" }}>
        {fieldTypes.map((fieldType) => (
          <MenuItem key={fieldType} value={fieldType as ANNOTATION_TYPE}>
            {fieldType}
          </MenuItem>
        ))}
      </Select>
      <ActionMenuItem onClick={onDelete} onMouseDown={NO_OP}>
        Delete
      </ActionMenuItem>
    </Container>
  );
};

interface LabelLayerActionMenuProps {
  position: React.CSSProperties;
  onUpdateLabel: () => void;
  onDelete: () => void;
  onCustomTooltipChange: (value: string) => void;
  customTooltip: string;
  showDelete: boolean;
  showCreateOrUpdateLabel: boolean;
  createOrUpdateLabelText: string;
  showAdditionalTooltip: boolean;
}

export const LabelLayerActionMenu: React.FC<LabelLayerActionMenuProps> = ({
  onDelete,
  onUpdateLabel,
  onCustomTooltipChange,
  customTooltip,
  showDelete,
  showCreateOrUpdateLabel,
  createOrUpdateLabelText,
  showAdditionalTooltip,
  position,
}) => {
  const hasNoMenuItems =
    !showDelete && !showCreateOrUpdateLabel && !showAdditionalTooltip;
  return (
    <Container position={position}>
      {hasNoMenuItems && (
        <ActionMenuItem onClick={NO_OP} onMouseDown={NO_OP}>
          No Possible Actions
        </ActionMenuItem>
      )}
      {showCreateOrUpdateLabel && (
        <ActionMenuItem onClick={onUpdateLabel} onMouseDown={NO_OP}>
          {createOrUpdateLabelText}
        </ActionMenuItem>
      )}
      {showDelete && (
        <ActionMenuItem onClick={onDelete} onMouseDown={NO_OP}>
          Delete
        </ActionMenuItem>
      )}
      {showAdditionalTooltip && (
        <ActionMenuItem onClick={NO_OP} onMouseDown={NO_OP}>
          <TextField
            id="custom-tooltip"
            variant="standard"
            placeholder="Custom Tooltip"
            margin="none"
            onClick={(e) => {
              e.stopPropagation();
            }}
            value={customTooltip}
            onChange={(e) => {
              onCustomTooltipChange(e.target.value);
            }}
          />
        </ActionMenuItem>
      )}
    </Container>
  );
};

interface GroupLayerActionMenuProps {
  onDelete: () => void;
  onCreateNewGroup: () => void;
  position: React.CSSProperties;
}

export const GroupLayerActionMenu: React.FC<GroupLayerActionMenuProps> = ({
  onDelete,
  onCreateNewGroup,
  position,
}) => {
  return (
    <Container position={position}>
      <ActionMenuItem onClick={onCreateNewGroup} onMouseDown={NO_OP}>
        Create New Group
      </ActionMenuItem>
      <ActionMenuItem onClick={onDelete} onMouseDown={NO_OP}>
        Remove from Group
      </ActionMenuItem>
    </Container>
  );
};
