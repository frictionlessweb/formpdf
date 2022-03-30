/** @jsxImportSource @emotion/react */

import React from "react";
import color from "./color";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FIELD_TYPE } from "../app/AccessibleForm";

interface ActionMenuProps {
  // Other components to render inside the ActionMenu div.
  children?: React.ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ children }) => {
  return (
    <div
      css={{
        transform: "translateY(-180%)",
        position: "absolute",
        width: "auto",
        height: "2.5rem",
        zIndex: 11,
      }}>
      <div
        css={{
          width: "auto",
          height: "100%",
          background: "white",
          boxShadow: `${color.gray.light} 0px 7px 29px 0px`,
          borderRadius: "0.5rem",
          display: "flex",
          alignItems: "center",
        }}>
        {children}
      </div>
    </div>
  );
};

interface FieldLayerActionMenuProps {
  onDelete: () => void;
  onFieldTypeChange: (value: FIELD_TYPE) => void;
}

export const FieldLayerActionMenu: React.FC<FieldLayerActionMenuProps> = ({
  onDelete,
  onFieldTypeChange,
}) => {
  return (
    <ActionMenu>
      <Select
        defaultValue={"TEXTBOX"}
        onChange={(e) => onFieldTypeChange(e.target.value as FIELD_TYPE)}
        css={{ height: "40px" }}>
        <MenuItem value={"TEXTBOX" as FIELD_TYPE}>Textbox</MenuItem>
        <MenuItem value={"RADIOBOX" as FIELD_TYPE}>Radiobox</MenuItem>
        <MenuItem value={"CHECKBOX" as FIELD_TYPE}>Checkbox</MenuItem>
      </Select>
      <ActionMenuItem>Duplicate</ActionMenuItem>
      <ActionMenuItem
        // We have to prevent the default behaviour for
        // the pdf canvas here, in order to be able to capture
        // the click event.
        onClick={(e) => {
          onDelete();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}>
        Delete
      </ActionMenuItem>
    </ActionMenu>
  );
};

interface ActionMenuItemProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = (props) => {
  const { children, ...rest } = props;
  return (
    <span
      {...rest}
      css={{
        width: "auto",
        minWidth: "4rem",
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
        },
        "&:firstOfType:hover": {
          borderTopLeftRadius: "0.5rem",
          borderBottomLeftRadius: "0.5rem",
        },
        "&:lastOfType:hover": {
          borderTopRightRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
        },
      }}>
      {children}
    </span>
  );
};
