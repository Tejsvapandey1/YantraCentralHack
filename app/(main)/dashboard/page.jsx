
import { getHealthSuggestions } from "../../../lib/gemini";
import TestPage from "../../../lib/test";
import DashboardClient from "./DashboardClient";

export default async function Page() {
  const data = await TestPage();
//   console.log(data);

  const suggestions = await getHealthSuggestions(data)
  return <DashboardClient data={data} suggestions={suggestions}/>;
}
