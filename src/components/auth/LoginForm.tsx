import { CandidateLoginPage } from "./CandidateLoginPage";

type LoginFormProps = {
  emailFeaturesEnabled?: boolean;
};

export function LoginForm({ emailFeaturesEnabled }: LoginFormProps) {
  return <CandidateLoginPage emailFeaturesEnabled={emailFeaturesEnabled} />;
}
