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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FormControl } from "@mui/material";

const Logo = () => {
  return (
    <Box position="fixed" left="24px" top="24px">
      <img src="/logo.svg" alt="logo of FormA11y" />
    </Box>
  );
};

const FormSelect = () => {
  // we cannot use useState here as we are reloading the page and clearing state
  // and all information will be lost this way.
  const currentForm =
    window.location.hash === "" ? "1" : window.location.hash.substring(1);
  return (
    <Box position="fixed" right="24px" top="24px">
      <FormControl size="small">
        <Select
          value={currentForm}
          onChange={(e) => {
            window.location.href =
              window.location.origin + "#" + e.target.value;
            // we clear the current state present in local storage, when page is reloaded new state is loaded automatically from the URL.
            window.localStorage.clear();
            window.location.reload();
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}>
          <MenuItem value={1}>Form 1</MenuItem>
          <MenuItem value={2}>Form 2</MenuItem>
          <MenuItem value={3}>Form 3</MenuItem>
          <MenuItem value={4}>Form 4</MenuItem>
          <MenuItem value={5}>Form 5</MenuItem>
        </Select>
      </FormControl>
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
      <FormSelect />
      <ProceedToNextLayer />
      <ResizeDialog />
    </Box>
  );
};

export default App;
