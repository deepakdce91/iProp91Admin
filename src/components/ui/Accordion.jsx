import React, { useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useTheme } from "@mui/material";
import axios from "axios";
import EditSafe from "../general/documents/EditSafe";
import EditCommonSafe from "../configurations/CommonSafe/EditCommonSafe";

// icon component
function Icon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${
        id === open ? "rotate-180" : ""
      } h-5 w-5 transition-transform`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

// main accordion component
export default function AccordionCustomIcon({
  userId,
  userToken,
  safeData,
  propertyId,
  commonSafeId,
}) {
  const structure = [
    {
      heading: "Layout plan",
      fieldName: "layoutPlan",
    }, //1
    {
      heading: "Demarcation cum zoning plan",
      fieldName: "demarcationCumZoningPlan",
    }, //2
    {
      heading: "Site plan",
      fieldName: "sitePlan",
    }, //3
    {
      heading: "Building plan",
      fieldName: "buildingPlan",
    }, //4
    {
      heading: "Floor plan",
      fieldName: "floorPlan",
    }, //5
    {
      heading: "RERA application",
      fieldName: "reraApplication",
    }, //6
    {
      heading: "Project brochure",
      fieldName: "projectBrochure",
    }, //7
    {
      heading: "Advertisement material by bulder ",
      fieldName: "advertisementMaterialByBulder",
    }, //8
    {
      heading: "Agreement to sale",
      fieldName: "agreementToSale",
    }, //9
    {
      heading: "Builder buyer agreement",
      fieldName: "builderBuyerAgreement",
    }, // 10
    {
      heading: "Demand letter",
      fieldName: "demandLetter",
    }, //11
    {
      heading: "Payment plan",
      fieldName: "paymentPlan",
    }, //12
    {
      heading: "Specifications amenities and facilities",
      fieldName: "specificationsAmenitiesAndFacilities",
    }, //13
    {
      heading: "Occupation certificate",
      fieldName: "occupationCertificate",
    }, //14
    {
      heading: "Sale deed",
      fieldName: "saleDeed",
    }, //15
    {
      heading: "Maintenence agreement",
      fieldName: "maintenenceAgreement",
    }, //16
    {
      heading: "Maintenence payment receipts",
      fieldName: "maintenencePaymentReceipts",
    }, //17
    {
      heading: "Maintenence Invoice",
      fieldName: "maintenenceInvoice",
    }, //18
    {
      heading: "Bill",
      fieldName: "bill",
    }, //19
    {
      heading: "Warranty documents",
      fieldName: "warrantyDocuments",
    }, //20
    {
      heading: "AMCS",
      fieldName: "amcs",
    }, //21
    {
      heading: "Electricity/Maintenence bills",
      fieldName: "electricityOrMaintenenceBills",
    }, //22
    {
      heading: "RWA rules and regulations",
      fieldName: "rwaRulesAndRegulations",
    }, //23
    {
      heading: "Other",
      fieldName: "other",
    }, //24
    {
      heading: "Loan Agreement",
      fieldName: "loanAgreement",
    }, //25
    {
      heading: "Payment plan loan",
      fieldName: "paymentPlanLoan",
    }, //26
    {
      heading: "Rent agreement/extensions/amendment agreement",
      fieldName: "rentAgreementOrExtensionsOrAmendmentAgreement",
    }, //27
    {
      heading: "Tenant KYC documents",
      fieldName: "tenantKycDocuments",
    }, //28
    {
      heading: "Rent receipt",
      fieldName: "rentReceipt",
    }, //29
    {
      heading: "TDS payment chalaan",
      fieldName: "tdsPaymentChalaan",
    }, //30
    {
      heading: "Handbook",
      fieldName: "handbook",
    }, //31
    {
      heading: "Loan handbook",
      fieldName: "loanHandbook",
    }, //32
    {
      heading: "key term rental handbook",
      fieldName: "keyTermRentalHandbook",
    }, //33
    {
      heading: "Recent updates",
      fieldName: "recentUpdates",
    }, //34
    {
      heading: "Allotment letter",
      fieldName: "allotmentLetter",
    }, //35
    {
      heading: "RERA approval",
      fieldName: "reraApproval",
    }, //36
  ];

  const theme = useTheme();

  const [open, setOpen] = useState(0);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <>
      {structure?.map((item, index) => {
        return (
          <Accordion
            key={`accordion-item-${index}`}
            className="mb-4 w-full"
            open={open === index + 1}
            icon={<Icon id={index + 1} open={open} />}
          >
            <AccordionHeader
              className="pb-2 bg-gray-200 bg-opacity-10 px-2 rounded-sm pt-1 flex justify-between items-center"
              onClick={() => handleOpen(index + 1)}
            >
              <span>{item.heading}</span>
            </AccordionHeader>
            <AccordionBody
              className={`mt-3 ${
                theme.palette.mode === "dark"
                  ? "text-gray-200"
                  : "text-gray-700"
              }`}
            >
              {commonSafeId && (
                <>
                  {safeData ? (
                    <EditCommonSafe
                      commonSafeId={commonSafeId}
                      userId={userId}
                      userToken={userToken}
                      fieldName={item.fieldName}
                      fieldData={safeData[item.fieldName]}
                    />
                  ) : (
                    <div>Sorry couldn't load data.</div>
                  )}
                </>
              )}
              {!commonSafeId && (
                <>
                  {" "}
                  {safeData ? (
                    <EditSafe
                      propertyId={propertyId}
                      userId={userId}
                      userToken={userToken}
                      safeId={safeData._id}
                      fieldName={item.fieldName}
                      fieldData={safeData[item.fieldName]}
                    />
                  ) : (
                    <div>Sorry couldn't load data.</div>
                  )}
                </>
              )}
            </AccordionBody>
          </Accordion>
        );
      })}
    </>
  );
}
