import { NEXT_PUBLIC_WEBAPP_URL } from "@documenso/lib/constants";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FieldType } from "@prisma/client";
import { createOrUpdateField, deleteField } from "@documenso/lib/api";
import { createField } from "@documenso/features/editor";
import RecipientSelector from "./recipient-selector";
import FieldTypeSelector from "./field-type-selector";
import toast from "react-hot-toast";
const stc = require("string-to-color");

const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
});

export default function PDFEditor(props: any) {
  const router = useRouter();
  const [fields, setFields] = useState<any[]>(props.document.Field);
  const [selectedRecipient, setSelectedRecipient]: any = useState();
  const [selectedFieldType, setSelectedFieldType] = useState();
  const noRecipients = props?.document.Recipient.length === 0;
  const [adding, setAdding] = useState(false);

  function onPositionChangedHandler(position: any, id: any) {
    if (!position) return;
    const movedField = fields.find((e) => e.id == id);
    movedField.positionX = position.x.toFixed(0);
    movedField.positionY = position.y.toFixed(0);
    createOrUpdateField(props.document, movedField);

    // no instant redraw neccessary, postion information for saving or later rerender is enough
    // setFields(newFields);
  }

  function onDeleteHandler(id: any) {
    const field = fields.find((e) => e.id == id);
    const fieldIndex = fields.map((item) => item.id).indexOf(id);
    if (fieldIndex > -1) {
      const fieldWithoutRemoved = [...fields];
      const removedField = fieldWithoutRemoved.splice(fieldIndex, 1);
      setFields(fieldWithoutRemoved);
      deleteField(field).catch((err) => {
        setFields(fieldWithoutRemoved.concat(removedField));
      });
    }
  }

  return (
    <>
      <div>
        <PDFViewer
          readonly={false}
          document={props.document}
          fields={fields}
          onPositionChanged={onPositionChangedHandler}
          onDelete={onDeleteHandler}
          pdfUrl={`${NEXT_PUBLIC_WEBAPP_URL}/api/documents/${router.query.id}`}
          onMouseUp={(e: any, page: number) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(adding);
            if (adding) {
              addField(e, page);
              setAdding(false);
            }
          }}
          onMouseDown={(e: any, page: number) => {
            addField(e, page);
          }}
        ></PDFViewer>
        <div
          hidden={noRecipients}
          className="fixed left-0 top-1/3 max-w-xs border border-slate-300 bg-white py-4 pr-5 rounded-md"
        >
          <RecipientSelector
            recipients={props?.document?.Recipient}
            onChange={setSelectedRecipient}
          />
          <hr className="m-3 border-slate-300"></hr>
          <FieldTypeSelector
            setAdding={setAdding}
            selectedRecipient={selectedRecipient}
            onChange={setSelectedFieldType}
          />
        </div>
      </div>
    </>
  );

  function addField(e: any, page: number) {
    if (!selectedRecipient) return;
    if (!selectedFieldType) return;

    const signatureField = createField(
      e,
      page,
      selectedRecipient,
      selectedFieldType
    );
    // toast.success("Adding " + selectedFieldType);

    createOrUpdateField(props?.document, signatureField).then((res) => {
      setFields(fields.concat(res));
    });
  }
}