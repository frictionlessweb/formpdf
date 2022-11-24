/** @jsxImportSource @emotion/react */
import { styled } from "@mui/material/styles";
import Box, { BoxProps } from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import color from "../components/color";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import { Step as StepType, STEPS, TOOL as ToolType } from "./StoreProvider";

// styled is a part of mui and is a recommendation for reusable style overrides.
// Ref: https://mui.com/customization/how-to-customize/#2-reusable-style-overrides
const Connector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 10px)",
    right: "calc(50% + 10px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: color.green.medium,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: color.green.medium,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: color.gray.dark,
    borderTopWidth: 2,
    borderRadius: 0.5,
  },
}));

const StepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: color.gray.dark,
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: color.green.medium,
    }),
    "& .StepIcon-completedIcon": {
      color: color.green.medium,
      zIndex: 1,
      fontSize: 18,
    },
    "& .StepIcon-circle": {
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
  })
);

function StepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <StepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="StepIcon-completedIcon" />
      ) : (
        <div className="StepIcon-circle" />
      )}
    </StepIconRoot>
  );
}

// FIXME: Why is `onStepChange` a prop? I think we can just dispatch in the render
// method.
const Steps: React.FC<{
  onStepChange: (step: StepType) => void;
  stepIndex: number;
}> = (props) => {
  const { onStepChange, stepIndex } = props;
  //BUG: is not boxProps inline style ?
  return (
    <Stepper
      css={{ width: "30%", maxWidth: "30rem" }}
      alternativeLabel
      activeStep={stepIndex}
      connector={<Connector />}>
      {STEPS.map((step, index) => (
        <Step key={step.title}>
          <StepLabel
            sx={{
              "& .MuiStepLabel-labelContainer .MuiStepLabel-label": {
                marginTop: 0.4,
              },
            }}
            StepIconComponent={StepIcon}>
            <span
              css={{
                cursor: "pointer",
                "&:hover": {
                  fontWeight: "bold",
                },
                fontWeight: stepIndex === index ? "bold" : "normal",
                fontSize: 12,
              }}
              onClick={() => onStepChange(step.id)}>
              {step.title}
            </span>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
export default Steps;
