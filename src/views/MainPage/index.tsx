import { useQuery } from "@tanstack/react-query";
import PageLayout from "@src/components/common/PageLayout";
import { remoteAdminAPI } from "@src/lib/api/remote/admin";
import { GetHomepageResponse } from "@src/lib/types/admin";
import Banner from "./components/Banner";
import Main from "./components/Main";
import Schedule from "./components/Schedule";
import Faq from "./components/Faq";

function MainPage() {
  const { data: adminData } = useQuery<GetHomepageResponse>({
    queryKey: ["homepage"],
    queryFn: remoteAdminAPI.getHomepage,
  });
  return (
    <PageLayout>
      <Banner mainColor={"#FF5E36"} highColor={"#"} />
      <Main />
      <Schedule />
      <Faq />
    </PageLayout>
  );
}

export default MainPage;
