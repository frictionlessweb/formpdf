/** @jsxImportSource @emotion/react */
import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector, useDispatch } from "./StoreProvider";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ResizeModalProps {}

const ResizeModal: React.FC<ResizeModalProps> = () => {
  const open = useSelector((state) => state.showResizeModal);
  const dispatch = useDispatch();

  // FIXME: This is not a good description for dialog. Update it.
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => dispatch({ type: "UNDO" })}
      aria-describedby="alert-dialog-slide-description">
      <DialogTitle>Resize Section?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Resize adds new fields to the section. To review them, you will be
          taken to the fields step of the process.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch({ type: "UNDO" })}>Cancel</Button>
        <Button onClick={() => dispatch({ type: "JUMP_BACK_TO_FIELD_LAYER" })}>
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResizeModal;
