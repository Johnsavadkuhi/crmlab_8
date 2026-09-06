import { Box, HStack, Text } from "@chakra-ui/react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAssetSummaryQuery } from "@/entities/asset/api/assetsApi";
import InventoryAnalytics from "@/entities/asset/ui/InventoryAnalytics";
import { useAuth } from "@/features/auth/model/useAuth";
import { useLanguage } from "@/features/language/model";
import Button from "@/shared/ui/primitives/Button";

export default function AssetDashboardWidget() {
  const { language } = useLanguage();
  const { roles } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAssetSummaryQuery();
  return (
    <Box
      as="section"
      p={4}
      bg="var(--apple-surface-raised)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="md"
    >
      <HStack mb={3} justify="space-between" flexWrap="wrap">
        <Box>
          <Text fontWeight="900">
            {language === "fa" ? "خلاصه دارایی‌ها" : "Asset inventory snapshot"}
          </Text>
          <Text color="var(--apple-muted)" fontSize="xs">
            {language === "fa"
              ? "مالکیت، تخصیص و هشدارهای چرخه عمر"
              : "Ownership, assignment and lifecycle alerts"}
          </Text>
        </Box>
        <Button variant="ghost" onClick={() => navigate("/inventory")}>
          <HStack>
            <Text>{language === "fa" ? "ورود به انبار" : "Open inventory"}</Text>
            <ArrowUpRight size={14} />
          </HStack>
        </Button>
      </HStack>
      {error ? (
        <Text color="var(--apple-danger-text)" fontSize="sm">
          {language === "fa"
            ? "خلاصه دارایی‌ها در دسترس نیست."
            : "Asset summary is unavailable."}
        </Text>
      ) : (
        <InventoryAnalytics
          summary={data}
          loading={isLoading}
          compact
          personalized={!roles.includes("admin")}
          language={language}
        />
      )}
    </Box>
  );
}
