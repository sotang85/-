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
          <h2 className="text-xl font-semibold">신규 거래처 등록</h2>
          <p className="text-sm text-slate-600">거래처 정보를 등록합니다.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/vendors">뒤로</Link>
        </Button>
      </div>

      <form action={createVendorAction} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">거래처명</label>
            <Input name="vendor_name" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">사업자등록번호</label>
            <Input name="biz_reg_no" required pattern="\d{10}" placeholder="10자리 숫자" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">거래처 유형</label>
            <Select name="vendor_type" required>
              <option value="supplier">공급사</option>
              <option value="agency">대행사</option>
              <option value="logistics">물류</option>
              <option value="IT">IT</option>
              <option value="other">기타</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">예상 연간 지출 (KRW)</label>
            <Input name="expected_annual_spend" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">선급금</label>
            <Select name="advance_payment">
              <option value="no">아니오</option>
              <option value="yes">예</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">개인정보 접근 수준</label>
            <Select name="pii_access_level" required>
              <option value="none">없음</option>
              <option value="limited">제한적</option>
              <option value="high">높음</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">공공조달 관련 여부</label>
            <Select name="public_procurement_related">
              <option value="no">아니오</option>
              <option value="yes">예</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">메모</label>
            <Input name="notes" />
          </div>
        </div>
        <Button type="submit">저장</Button>
      </form>
    </div>
  );
}
