import Layout from "@/components/auth/Layout";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <Layout
      title="Welcome to Restroom"
      secondTitle="Real-time insights for real-time care. Sensors that track and enhance hygiene. Efficient management at your fingertips.
"
    >
      <LoginForm />
    </Layout>
  );
};

export default Login;
