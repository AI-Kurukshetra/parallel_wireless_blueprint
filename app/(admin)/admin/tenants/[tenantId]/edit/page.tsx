import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { TenantForm } from "@/features/admin/components/tenant-form";
import { updateTenantAction } from "@/features/admin/lib/actions";
import { getAdminTenantDetail } from "@/features/admin/lib/get-admin-tenant-detail";

export default async function AdminTenantEditPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const detail = await getAdminTenantDetail(tenantId);
  const action = updateTenantAction.bind(null, detail.tenant.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edit tenant"
        title={detail.tenant.name}
        description="Update tenant account metadata and activation status."
        action={
          <ButtonLink href={`/admin/tenants/${detail.tenant.id}`} className="bg-white text-ink ring-1 ring-ink/10">
            Back to Tenant
          </ButtonLink>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Tenant details</CardTitle>
        </CardHeader>
        <CardContent>
          <TenantForm
            action={action}
            submitLabel="Save Tenant"
            defaultValues={{
              name: detail.tenant.name,
              slug: detail.tenant.slug,
              defaultRegion: detail.tenant.default_region,
              criticalAlarmThreshold: detail.tenant.critical_alarm_threshold,
              isActive: detail.tenant.is_active
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
