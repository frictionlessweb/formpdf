/** @jsxImportSource @emotion/react */
import { styled } from "@mui/material/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import color from "../components/color";
import { StepIconProps } from "@mui/material/StepIcon";
import { Step as StepType, STEPS } from "./StoreProvider";
import { StepConnector, stepConnectorClasses } from "@mui/material";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 10px)",
    right: "calc(50% + 10px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: color.gray.dark,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: color.gray.dark,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 2,
    borderRadius: 0.5,
  },
}));

const StepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: color.gray.dark,
    display: "flex",
    height: 18,
    alignItems: "center",
    ...(ownerState.active && {
      color: color.blue.medium,
    }),
    "& .StepIcon-completedIcon": {
      width: "1rem",
      color: color.gray.dark,
      zIndex: 1,
    },
    "& .StepIcon-circle": {
      width: "1rem",
      color: "currentColor",
    },
  })
);

function StepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  let Icon = <CircleOutlinedIcon className="StepIcon-circle" />;

  if (active) {
    Icon = <RadioButtonCheckedOutlinedIcon className="StepIcon-circle" />;
  }
  if (completed) {
    Icon = <CheckCircleIcon className="StepIcon-completedIcon" />;
  }

  return (
    <StepIconRoot ownerState={{ active }} className={className}>
      {Icon}
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
      css={{ width: "300px", maxWidth: "30rem" }}
      connector={<Connector />}
      activeStep={stepIndex}>
      {STEPS.map((step, index) => (
        <Step key={step.title} onClick={() => onStepChange(step.id)}>
          <StepLabel
            StepIconComponent={StepIcon}
            sx={{
              cursor: "pointer",
              "&:hover span": {
                fontWeight: "bold",
              },
            }}>
            <span
              css={{
                fontWeight: stepIndex === index ? "bold" : "normal",
                color:
                  stepIndex === index ? color.blue.medium : color.gray.dark,
                fontSize: "12px",
              }}>
              {step.title}
            </span>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
export default Steps;
