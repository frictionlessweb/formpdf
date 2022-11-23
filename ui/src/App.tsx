/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import {
  FormSelect,
  ExitButtonForCreateTool,
  Header,
  PreviewTooltipCheckbox,
} from "./app/Header";
import PDF from "./app/PDF";
import { Zoom } from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import ResizeDialog from "./app/ResizeModal";
import { useSaveState, getPdfUrl } from "./app/utils";
import color from "./components/color";

const App = () => {
  useSaveState();
  const pdfUrl = getPdfUrl();
  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ backgroundColor: color.gray.dark, userSelect: "none" }}>
      <Header />
      <ToolSelect />
      <Box
        display="flex"
        justifyContent="flex-start"
        marginTop="0.4rem"
        marginLeft="8rem">
        <PDF url={pdfUrl} />
      </Box>
      <ExitButtonForCreateTool />
      <Zoom />
      <PreviewTooltipCheckbox />
      <FormSelect />
      <ResizeDialog />
    </Box>
  );
};

export default App;
