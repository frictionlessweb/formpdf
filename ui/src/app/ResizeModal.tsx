/** @jsxImportSource @emotion/react */
import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useSelector, useDispatch } from "./StoreProvider";

interface ResizeModalProps {}

const ResizeModal: React.FC<ResizeModalProps> = () => {
  const open = useSelector((state) => state.showResizeModal);
  const dispatch = useDispatch();
  return (
    <Modal open={open}>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "white",
          padding: "16px",
          boxShadow: "24px solid white",
        }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Resizing Section
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Warning: You have tried to resize the current section. Accepting this
          action will take you back to the first step of the process. Proceed?
        </Typography>
        <div
          css={{
            display: "flex",
            width: "100%",
            paddingTop: "16px",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}>
          <Button
            onClick={() => dispatch({ type: "JUMP_BACK_TO_FIELD_LAYER" })}
            variant="contained">
            Yes
          </Button>
          <Button
            onClick={() => dispatch({ type: "UNDO" })}
            variant="contained">
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResizeModal;
