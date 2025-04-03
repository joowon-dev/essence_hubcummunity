import { useQuery } from "@tanstack/react-query";
import PageLayout from "@src/components/common/PageLayout";
import { remoteAdminAPI } from "@src/lib/api/remote/admin";
import { GetHomepageResponse } from "@src/lib/types/admin";
import Banner from "./components/Banner";
import Main from "./components/Main";
import Schedule from "./components/Schedule";
import Faq from "./components/Faq";
import TshirtsBanner from "./components/TshirtsBanner";
import ContentBanner from "./components/ContentBanner";
function MainPage() {
  const { data: adminData } = useQuery<GetHomepageResponse>({
    queryKey: ["homepage"],
    queryFn: remoteAdminAPI.getHomepage,
  });
  return (
    <PageLayout>
      <Banner  />
      <Main />
      <Schedule />
      <TshirtsBanner />
      <Faq />
      <ContentBanner />
    </PageLayout>
  );
}

export default MainPage;
