"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { addressSchema, type AddressSchema } from "@/lib/validation/checkoutSchema";

export type AddressFormProps = {
  defaultValues?: AddressSchema;
  onSubmit: (address: AddressSchema) => void;
};

export function AddressForm({ defaultValues, onSubmit }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  return (
    <Card>
      <h2 className="mb-4 text-sm font-medium text-neutral-900">Shipping address</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Address line 1" htmlFor="line1" error={errors.line1?.message}>
          <Input id="line1" invalid={!!errors.line1} {...register("line1")} />
        </FormField>
        <FormField label="Address line 2 (optional)" htmlFor="line2" error={errors.line2?.message}>
          <Input id="line2" invalid={!!errors.line2} {...register("line2")} />
        </FormField>
        <div className="flex gap-4">
          <FormField label="City" htmlFor="city" error={errors.city?.message} className="flex-1">
            <Input id="city" invalid={!!errors.city} {...register("city")} />
          </FormField>
          <FormField
            label="Postal code"
            htmlFor="postalCode"
            error={errors.postalCode?.message}
            className="flex-1"
          >
            <Input id="postalCode" invalid={!!errors.postalCode} {...register("postalCode")} />
          </FormField>
        </div>
        <FormField label="Country" htmlFor="country" error={errors.country?.message}>
          <Input id="country" invalid={!!errors.country} {...register("country")} />
        </FormField>
        <Button type="submit" className="mt-2 self-start">
          Continue to payment
        </Button>
      </form>
    </Card>
  );
}
