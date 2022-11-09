/** @jsxImportSource @emotion/react */

import React from "react";
import color from "./color";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ANNOTATION_TYPE, fieldTypes } from "../app/StoreProvider";
import { CSSObject } from "@emotion/react";
import TextField from "@mui/material/TextField";

interface ContainerProps {
  // Other components to render inside the Container div.
  children?: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div
      css={{
        transform: "translateY(calc(-100% - 12px))",
        position: "absolute",
        width: "auto",
        height: "2.5rem",
        userSelect: "none",
      }}>
      <div
        css={{
          width: "auto",
          height: "100%",
          background: "white",
          boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
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
  value: ANNOTATION_TYPE;
  onDelete: () => void;
  onFieldTypeChange: (value: ANNOTATION_TYPE) => void;
}

export const FieldLayerActionMenu: React.FC<FieldLayerActionMenuProps> = (
  props
) => {
  const { value, onDelete, onFieldTypeChange } = props;
  return (
    <Container>
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
    </Container>
  );
};

interface LabelLayerActionMenuProps {
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
}) => {
  const hasNoMenuItems =
    !showDelete && !showCreateOrUpdateLabel && !showAdditionalTooltip;
  return (
    <Container>
      {hasNoMenuItems && (
        <ActionMenuItem
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}>
          No Possible Actions
        </ActionMenuItem>
      )}
      {showCreateOrUpdateLabel && (
        <ActionMenuItem
          // We have to prevent the default behaviour for
          // the pdf canvas here, in order to be able to capture
          // the click event.
          onClick={(e) => {
            onUpdateLabel();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}>
          {createOrUpdateLabelText}
        </ActionMenuItem>
      )}
      {showDelete && (
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
      )}
      {showAdditionalTooltip && (
        <ActionMenuItem>
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
  type: string;
  groupOptions: { label: string; value: string }[];
  onGroupChange: (value: string) => void;
  currentGroup: string;
}

export const GroupLayerActionMenu: React.FC<GroupLayerActionMenuProps> = ({
  onDelete,
  onCreateNewGroup,
  groupOptions,
  onGroupChange,
  currentGroup,
  type,
}) => {
  return (
    <Container>
      {["CHECKBOX", "RADIOBOX"].includes(type) && (
        <ActionMenuItem
          moreCss={{ width: "200px" }}
          onClick={(e) => {
            onCreateNewGroup();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}>
          Create New Group
        </ActionMenuItem>
      )}
      <Select
        label="Move to Group"
        value={currentGroup}
        onChange={(e) => onGroupChange(e.target.value as ANNOTATION_TYPE)}
        css={{ height: "40px" }}>
        <MenuItem value={"None"}>{"Move To Group..."}</MenuItem>
        {groupOptions.map((groupOption) => (
          <MenuItem key={groupOption.value} value={groupOption.value}>
            {groupOption.label}
          </MenuItem>
        ))}
      </Select>

      {["CHECKBOX", "RADIOBOX"].includes(type) && (
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
          Remove from Group
        </ActionMenuItem>
      )}
    </Container>
  );
};

interface ActionMenuItemProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  moreCss?: CSSObject;
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = (props) => {
  const { children, moreCss, ...rest } = props;
  return (
    <span
      {...rest}
      css={{
        width: "auto",
        minWidth: "6.5rem",
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
        ...moreCss,
      }}>
      {children}
    </span>
  );
};
