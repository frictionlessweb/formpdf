/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import Heading from "./app/Heading";
import PDFUI from "./app/PDF";
import Zoom from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import { useSaveState } from "./app/utils";

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
        <PDFUI width={1000} height={550} url="/sample_form.pdf" />
        <div css={{ width: "180px", paddingX: "16px" }} />
      </Box>
      <Zoom />
    </Box>
  );
};

export default App;
