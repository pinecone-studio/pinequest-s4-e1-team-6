import AdminFeaturePlaceholder from "../../components/modules/AdminFeaturePlaceholder";
import { ADMIN_FEATURES_BY_SLUG } from "../../lib/adminFeatures";

export default function RefundManagerPage() {
  return (
    <AdminFeaturePlaceholder feature={ADMIN_FEATURES_BY_SLUG["refund-manager"]} />
  );
}
