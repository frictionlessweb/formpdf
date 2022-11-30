/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import { FormSelect, ExitButtonForCreateTool, Header } from "./app/Header";
import PDF from "./app/PDF";
import { Zoom } from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import ResizeDialog from "./app/ResizeModal";
import { getPdfUrl, useSaveState } from "./app/utils";
import color from "./components/color";
import { PreviewTooltipCheckbox, CustomTooltip } from "./app/Tooltips";

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
        fontSize: "0.88rem",
      }}>
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
      <SaveState />
      <CustomTooltip />
    </Box>
  );
};

export default App;
