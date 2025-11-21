"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Vendor RFQ Comparison as the default first tab
    router.replace("/vendor-rfq-comparison");
  }, [router]);

                      return null;
                    }
