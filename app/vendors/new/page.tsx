import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createVendorAction } from "@/app/vendors/new/actions";

export default function NewVendorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">New Vendor</h2>
          <p className="text-sm text-slate-600">Register a vendor for screening.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/vendors">Back</Link>
        </Button>
      </div>

      <form action={createVendorAction} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor name</label>
            <Input name="vendor_name" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business registration number</label>
            <Input name="biz_reg_no" required pattern="\d{10}" placeholder="10 digits" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor type</label>
            <Select name="vendor_type" required>
              <option value="supplier">Supplier</option>
              <option value="agency">Agency</option>
              <option value="logistics">Logistics</option>
              <option value="IT">IT</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected annual spend (KRW)</label>
            <Input name="expected_annual_spend" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Advance payment</label>
            <Select name="advance_payment">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PII access level</label>
            <Select name="pii_access_level" required>
              <option value="none">None</option>
              <option value="limited">Limited</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Public procurement related</label>
            <Select name="public_procurement_related">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <Input name="notes" />
          </div>
        </div>
        <Button type="submit">Save vendor</Button>
      </form>
    </div>
  );
}
