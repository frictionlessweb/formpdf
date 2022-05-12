/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import Heading from "./app/Heading";
import PDF from "./app/PDF";
import Zoom from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import ResizeModal from "./app/ResizeModal";
import { useSaveState } from "./app/utils";
import ProceedToNextLayer from "./app/ProceedToNextLayer";

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
      <Heading paddingBottom="24px" />
      <Box display="flex" width="100%" justifyContent="center" marginTop="40px">
        <ToolSelect width="180px" paddingX="16px" />
        <PDF url="/sample_form.pdf" />
        <div css={{ width: "180px", paddingX: "16px" }} />
      </Box>
      <ProceedToNextLayer />
      <ResizeModal />
      <Zoom />
    </Box>
  );
};

export default App;
