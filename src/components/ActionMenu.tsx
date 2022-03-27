/** @jsxImportSource @emotion/react */

import React from "react";
import color from "./color";
import styled from "@emotion/styled";
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
  // FIXME: Is this the right way to define function type in TS.
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

// FIXME: Change styled component to css object.
const ActionMenuItem = styled.span`
  width: auto;
  min-width: 4rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-family: "Roboto", sans-serif;
  font-weight: 700;
  border-right: 1px solid ${color.gray.line};
  img {
    width: 100%;
    height: 100%;
    max-width: 1rem;
    max-height: 1.125rem;
  }
  &:last-of-type {
    border-right: none;
  }

  &:hover {
    background: ${color.gray.line};
    cursor: pointer;
  }

  &:first-of-type:hover {
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }

  &:last-of-type:hover {
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
`;
