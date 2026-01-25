import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { App } from "../../components/App";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession();

  if (!session) {
    return redirect("/login");
  }

  return <App>{children}</App>;
};

export default Layout;
