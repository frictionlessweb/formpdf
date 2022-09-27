/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import StepsNav from "./app/StepsNav";
import PDF from "./app/PDF";
import Zoom from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import UndoAndRedo from "./components/UndoAndRedo";
import ResizeDialog from "./app/ResizeModal";
import { useSaveState, getPdfUrl } from "./app/utils";
import ProceedToNextLayer from "./app/ProceedToNextLayer";
import color from "./components/color";

const Logo = () => {
  return (
    <Box position="fixed" left="24px" top="24px">
      <img src="/logo.svg" alt="logo of FormA11y" />
    </Box>
  );
};

const App = () => {
  useSaveState();
  const pdfUrl = getPdfUrl();
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingX="24px"
      paddingY="24px"
      sx={{ backgroundColor: color.gray.line }}>
      <StepsNav paddingBottom="24px" />
      <ToolSelect />
      <Box display="flex" width="100%" justifyContent="center" marginTop="8px">
        <PDF url={pdfUrl} />
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
