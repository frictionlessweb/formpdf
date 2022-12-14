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
        // change these properties to change the positioning of the canvas
        // don't go into PDF component and change thing or else it will break.
        // we give marginLeft 4.2 here because left toolbar is positioned absolute
        // as positions are calculated based on PDF component. We give marginTop 0.2 here
        // because top toolbar is not positioned absolute
        display="flex"
        justifyContent="center"
        marginLeft="4.2rem"
        marginTop="0.2rem"
        width="calc(100vw - 4.2rem)"
        height="calc(100vh - 4.2rem)"
        overflow="auto">
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
