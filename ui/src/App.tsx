/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import StepsNav from "./app/StepsNav";
import PDF from "./app/PDF";
import Zoom from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import UndoAndRedo from "./components/UndoAndRedo";
import ResizeDialog from "./app/ResizeModal";
import { useSaveState } from "./app/utils";
import ProceedToNextLayer from "./app/ProceedToNextLayer";

const Logo = () => {
  return (
    <Box position="fixed" left="24px" top="24px">
      <img src="/logo.svg" alt="logo of FormA11y" />
    </Box>
  );
};

const App = () => {
  useSaveState();
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingX="48px"
      paddingY="24px">
      <StepsNav paddingBottom="24px" />
      <Box display="flex" width="100%" justifyContent="center" marginTop="40px">
        <ToolSelect width="180px" paddingX="16px" />
        <PDF url="/sample_form.pdf" />
        <div css={{ width: "180px", paddingX: "16px" }} />
      </Box>
      <UndoAndRedo />
      <Zoom />
      <Logo />
      <ProceedToNextLayer />
      <ResizeDialog />
    </Box>
  );
};

export default App;
