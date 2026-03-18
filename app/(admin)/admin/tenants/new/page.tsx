import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { TenantForm } from "@/features/admin/components/tenant-form";
import { createTenantAction } from "@/features/admin/lib/actions";

export default function AdminTenantNewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Create tenant"
        title="New Tenant"
        description="Create a new tenant account before assigning users or onboarding data."
        action={
          <ButtonLink href="/admin/tenants" className="bg-white text-ink ring-1 ring-ink/10">
            Back to Tenants
          </ButtonLink>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Tenant details</CardTitle>
        </CardHeader>
        <CardContent>
          <TenantForm action={createTenantAction} submitLabel="Create Tenant" />
        </CardContent>
      </Card>
    </div>
  );
}
