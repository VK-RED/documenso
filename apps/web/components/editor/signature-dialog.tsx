import { classNames } from "@documenso/lib";
import { Button, IconButton } from "@documenso/ui";
import { Dialog, Transition } from "@headlessui/react";
import {
  LanguageIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { localStorage } from "@documenso/lib";

const tabs = [
  { name: "Type", icon: LanguageIcon, current: true },
  { name: "Draw", icon: PencilIcon, current: false },
];

export default function SignatureDialog(props: any) {
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [typedSignature, setTypedSignature] = useState("");
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  let signCanvasRef: any | undefined;

  useEffect(() => {
    setTypedSignature(localStorage.getItem("typedSignature") || "");
  }, []);

  return (
    <>
      <Transition.Root show={props.open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={props.setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="min-h-[350px] relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div className="">
                    <div className="border-b border-gray-200 mb-3">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                          <a
                            key={tab.name}
                            onClick={() => {
                              setCurrent(tab);
                            }}
                            className={classNames(
                              tab.current
                                ? "border-neon text-neon"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                              "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm cursor-pointer"
                            )}
                            aria-current={tab.current ? "page" : undefined}
                          >
                            <tab.icon
                              className={classNames(
                                tab.current
                                  ? "text-neon"
                                  : "text-gray-400 group-hover:text-gray-500",
                                "-ml-0.5 mr-2 h-5 w-5"
                              )}
                              aria-hidden="true"
                            />
                            <span>{tab.name}</span>
                          </a>
                        ))}
                      </nav>
                    </div>
                    {isCurrentTab("Type") ? (
                      <div>
                        <div className="my-8 border-b border-gray-300 mb-3">
                          <input
                            value={typedSignature}
                            onChange={(e) => {
                              setTypedSignature(e.target.value);
                            }}
                            className={classNames(
                              typedSignature ? "font-qwigley text-4xl" : "",
                              "leading-none h-10 align-bottom mt-14 text-center block w-full focus:border-neon focus:ring-neon text-2xl"
                            )}
                            placeholder="Kindly type your name"
                          />
                        </div>
                        <div className="float-right">
                          <Button
                            color="secondary"
                            onClick={() => {
                              props.onClose();
                              props.setOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="ml-3"
                            disabled={!typedSignature}
                            onClick={() => {
                              localStorage.setItem(
                                "typedSignature",
                                typedSignature
                              );
                              props.onClose({
                                type: "type",
                                typedSignature: typedSignature,
                              });
                            }}
                          >
                            Sign
                          </Button>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {isCurrentTab("Draw") ? (
                      <div className="">
                        <SignatureCanvas
                          ref={(ref) => {
                            signCanvasRef = ref;
                          }}
                          canvasProps={{
                            className:
                              "sigCanvas border-b b-2 border-slate w-full h-full mb-3",
                          }}
                          clearOnResize={true}
                          onEnd={() => {
                            setSignatureEmpty(signCanvasRef?.isEmpty());
                          }}
                        />
                        <IconButton
                          className="block float-left"
                          icon={TrashIcon}
                          onClick={() => {
                            signCanvasRef?.clear();
                            setSignatureEmpty(signCanvasRef?.isEmpty());
                          }}
                        ></IconButton>
                        <div className="mt-10 float-right">
                          <Button
                            color="secondary"
                            onClick={() => {
                              props.onClose();
                              props.setOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="ml-3"
                            onClick={() => {
                              props.onClose({
                                type: "draw",
                                signatureImage:
                                  signCanvasRef.toDataURL("image/png"),
                              });
                            }}
                            disabled={signatureEmpty}
                          >
                            Sign
                          </Button>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );

  function isCurrentTab(tabName: string): boolean {
    return currentTab.name === tabName;
  }

  function setCurrent(t: any) {
    tabs.forEach((tab) => {
      tab.current = tab.name === t.name;
    });
    setCurrentTab(t);
  }
}