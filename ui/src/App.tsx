/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import { ExitButtonForCreateTool, Header } from "./app/Header";
import PDF from "./app/PDF";
import ToolSelect from "./app/ToolSelect";
import ResizeDialog from "./app/ResizeModal";
import { getPdfUrl, useSaveState } from "./app/utils";
import color from "./components/color";
import {
  PreviewTooltipCheckbox,
  CustomTooltip,
  TooltipHelp,
} from "./app/Tooltips";

// We didn't add this to app, or else it will re-render the whole App.
const SaveState = () => {
  useSaveState();
  return null;
};

const App = () => {
  const pdfUrl = getPdfUrl();
  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        backgroundColor: color.gray.dark,
        userSelect: "none",
        fontSize: "14px",
        color: color.gray.dark,
        fontFamily: "Inter, sans-serif",
      }}>
      <Header />
      <ToolSelect />
      <Box
        display="flex"
        justifyContent="flex-start"
        marginLeft="8rem"
        marginTop="0.2rem">
        <PDF url={pdfUrl} />
      </Box>
      <ExitButtonForCreateTool />
      <PreviewTooltipCheckbox />
      <ResizeDialog />
      <SaveState />
      <CustomTooltip />
      <TooltipHelp />
    </Box>
  );
};

export default App;
