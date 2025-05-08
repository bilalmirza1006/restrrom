import Layout from "@/components/auth/Layout";
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <Layout
      title="Welcome to Restroom"
      secondTitle="Real-time insights for real-time care. Sensors that track and enhance hygiene. Efficient management at your fingertips.
"
    >
      <SignupForm />
    </Layout>
  );
};

export default Signup;
