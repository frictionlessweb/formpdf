/** @jsxImportSource @emotion/react */

import React from "react";
import color from "./color";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ANNOTATION_TYPE, fieldTypes, useSelector } from "../app/StoreProvider";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import ViewCompactAltOutlinedIcon from "@mui/icons-material/ViewCompactAltOutlined";

const NO_OP = () => {};

interface ContainerProps {
  // Other components to render inside the Container div.
  children?: React.ReactNode;
  position: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({ children, position }) => {
  return (
    <div
      onMouseDown={(e) => {
        // We stop propagation with the goal of preventing annotation being selected.
        e.stopPropagation();
      }}
      css={{
        transform: "translateY(calc(-100% - 12px))",
        position: "absolute",
        ...position,
        width: "auto",
        height: "2.5rem",
        zIndex: 500,
        background: "white",
        boxShadow: [
          "0 1px 1px rgba(100, 100, 100, 0.8) ",
          "0 4px 4px rgba(100, 100, 100, 0.4) ",
          "0 8px 8px rgba(100, 100, 100, 0.4) ",
        ],
        border: `1px solid ${color.gray.line}`,
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
        "& > span": {
          borderRight: `1px solid ${color.gray.line}`,
        },
        "& > span:first-of-type": {
          borderRadius: "0.5rem 0 0 0.5rem",
        },
        "& > span:last-of-type": {
          borderRadius: "0 0.5rem 0.5rem 0",
          borderRight: "none",
        },
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
        padding: "0 0.8rem",
        color: color.gray.darker,
        gap: "0.2rem",
        fontFamily: "Roboto Medium",
        fontWeight: 100,
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

function capitalizeFirstLetterOfText(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export const FieldLayerActionMenu: React.FC<FieldLayerActionMenuProps> = (
  props
) => {
  const { value, onDelete, onFieldTypeChange, position } = props;
  const multipleFieldsAreSelected = useSelector((store): boolean => {
    const theSelectedAnnotations = Object.keys(
      store.selectedAnnotations
    ).filter((key) => {
      return store.selectedAnnotations[key] === true;
    });

    const theAnnotations = theSelectedAnnotations.map((selected) => {
      return store.annotations[selected];
    });

    return theAnnotations.some((annotation) => {
      return annotation.type !== theAnnotations[0].type;
    });
  });
  return (
    <Container position={position}>
      <span>
        <Select
          value={multipleFieldsAreSelected ? "Multiple" : value}
          sx={{
            height: "40px",
            ".MuiOutlinedInput-notchedOutline": { border: 0 },
          }}>
          {multipleFieldsAreSelected && (
            <MenuItem value="Multiple" disabled>
              Multiple
            </MenuItem>
          )}
          {fieldTypes.map((fieldType) => (
            <MenuItem
              key={fieldType}
              value={fieldType as ANNOTATION_TYPE}
              onClick={() => {
                onFieldTypeChange(fieldType as ANNOTATION_TYPE);
              }}>
              {capitalizeFirstLetterOfText(fieldType)}
            </MenuItem>
          ))}
        </Select>
      </span>
      <ActionMenuItem onClick={onDelete} onMouseDown={NO_OP}>
        <DeleteOutlineIcon sx={{ color: color.gray.darker }} />
        Delete
      </ActionMenuItem>
    </Container>
  );
};

interface LabelLayerActionMenuProps {
  position: React.CSSProperties;
  onUpdateLabel: () => void;
  onDelete: () => void;
  showDelete: boolean;
  showCreateOrUpdateLabel: boolean;
  createOrUpdateLabelText: string;
}

export const LabelLayerActionMenu: React.FC<LabelLayerActionMenuProps> = ({
  onDelete,
  onUpdateLabel,
  showDelete,
  showCreateOrUpdateLabel,
  createOrUpdateLabelText,
  position,
}) => {
  const hasNoMenuItems = !showDelete && !showCreateOrUpdateLabel;
  return (
    <Container position={position}>
      {hasNoMenuItems && (
        <ActionMenuItem onClick={NO_OP} onMouseDown={NO_OP}>
          No Possible Actions
        </ActionMenuItem>
      )}
      {showCreateOrUpdateLabel && (
        <ActionMenuItem onClick={onUpdateLabel} onMouseDown={NO_OP}>
          <CableOutlinedIcon sx={{ color: color.gray.darker }} />
          {createOrUpdateLabelText}
        </ActionMenuItem>
      )}
      {showDelete && (
        <ActionMenuItem onClick={onDelete} onMouseDown={NO_OP}>
          <DeleteOutlineIcon sx={{ color: color.gray.darker }} />
          Delete Label
        </ActionMenuItem>
      )}
    </Container>
  );
};

interface GroupLayerActionMenuProps {
  onDelete: () => void;
  onCreateNewGroup: () => void;
  position: React.CSSProperties;
  showDelete?: boolean;
  showCreate?: boolean;
}

export const GroupLayerActionMenu: React.FC<GroupLayerActionMenuProps> = ({
  onDelete,
  onCreateNewGroup,
  position,
  showDelete = true,
  showCreate = true,
}) => {
  return (
    <Container position={position}>
      {showCreate && (
        <ActionMenuItem onClick={onCreateNewGroup} onMouseDown={NO_OP}>
          <ViewCompactAltOutlinedIcon
            sx={{ color: color.gray.darker, strokeWidth: 0.2 }}
          />
          Create Group
        </ActionMenuItem>
      )}
      {showDelete && (
        <ActionMenuItem onClick={onDelete} onMouseDown={NO_OP}>
          <DeleteOutlineIcon />
          Remove from Group
        </ActionMenuItem>
      )}
    </Container>
  );
};
