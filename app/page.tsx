"use client";

import JavaScriptIcon from "@/components/icons/javascript-icon";
import PictureIcon from "@/components/icons/picture-icon";
import PythonIcon from "@/components/icons/python-icon";
import Spinner from "@/components/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lora, LORAS } from "@/data/loras";
import imagePlaceholder from "@/public/image-placeholder.png";
import logo from "@/public/logo.png";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { z } from "zod";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [userAPIKey, setUserAPIKey] = useState("");
  const [selectedLoraModel, setSelectedLoraModel] = useState<Lora["model"]>();
  const [submittedLoraModel, setSubmittedLoraModel] = useState<Lora["model"]>();
  const [submittedSeed, setSubmittedSeed] = useState<number>();

  function saveAPIKey(key: string) {
    setUserAPIKey(key);
    if (key) {
      localStorage.setItem("togetherApiKey", key);
    } else {
      localStorage.removeItem("togetherApiKey");
    }
  }

  useEffect(() => {
    const key = localStorage.getItem("togetherApiKey") ?? "";
    setUserAPIKey(key);
  }, []);

  const { data, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
    queryKey: [submittedPrompt, submittedLoraModel, userAPIKey, submittedSeed],
    queryFn: async () => {
      let res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: submittedPrompt,
          lora: submittedLoraModel,
          userAPIKey,
          seed: submittedSeed,
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      let data = await res.json();

      return imageResponseSchema.parse(data);
    },
    enabled: !!(submittedPrompt.trim() && submittedLoraModel),
    staleTime: Infinity,
    retry: false,
  });

  const selectedLora = LORAS.find((l) => l.model === selectedLoraModel);
  const submittedLora = LORAS.find((l) => l.model === submittedLoraModel);

  return (
    <div className="h-full">
      <form
        className="h-full"
        action={() => {
          setSubmittedPrompt(prompt);
          setSubmittedLoraModel(selectedLoraModel);
          setSubmittedSeed(Math.floor(Math.random() * 9999999) + 1);
        }}
      >
        <fieldset className="flex h-full grow flex-col md:flex-row">
          <div className="max-w-sm bg-gray-100">
            <div className="flex w-full flex-col border-b border-gray-300 p-5 max-md:mt-4">
              <label className="text-xs font-medium">
                <a
                  href="https://api.together.xyz/settings/api-keys"
                  target="_blank"
                  className="inline-flex items-center gap-0.5 font-mono tracking-tight transition hover:text-blue-500"
                >
                  Together AI API Key
                  <ArrowUpRightIcon className="size-3" />
                </a>{" "}
              </label>
              <input
                placeholder="Enter your API key"
                type="password"
                autoComplete="new-password"
                value={userAPIKey}
                className="mt-2 rounded-md border border-gray-300 bg-gray-200 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 hover:border-gray-400/70 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-500"
                onChange={(e) => saveAPIKey(e.target.value)}
              />
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-8">
                <div>
                  <p className="font-mono font-medium tracking-tight">
                    Select a LoRA
                  </p>
                  <RadioGroup.Root
                    name="lora"
                    value={selectedLoraModel}
                    onValueChange={setSelectedLoraModel}
                    className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3"
                  >
                    {LORAS.map((lora) => (
                      <div
                        className="relative [&_input]:inset-0 [&_input]:!translate-x-0"
                        key={lora.id}
                      >
                        <RadioGroup.Item
                          value={lora.model}
                          className="group relative flex flex-col justify-start rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                          required
                        >
                          <div className="relative">
                            <div className="relative">
                              <Image
                                className="aspect-[37/24] rounded object-cover object-center"
                                src={lora.image}
                                alt={lora.name}
                              />
                              <div className="absolute inset-0 rounded-[4px] ring-1 ring-inset ring-black/10 group-hover:ring-black/20" />
                              <div className="absolute bottom-1.5 right-1.5 rounded-sm bg-white/60 px-1.5 pb-1 pt-0.5 leading-[13px] shadow-sm backdrop-blur-[2px]">
                                <span className="text-xs font-medium leading-none text-gray-900">
                                  {lora.name}
                                </span>
                              </div>
                            </div>
                            {/* <div className="mt-1 line-clamp-1 text-sm font-light text-gray-400">
                              {lora.model}
                            </div> */}
                            {/* <div className="flex items-center space-x-1.5">
                              <h3 className="text-gray-700">{lora.name}</h3>
                              <div>
                                <a href={lora.url} target="_blank" className="">
                                  <ArrowUpRightIcon className="size-3" />
                                </a>
                              </div>
                            </div> */}
                          </div>
                          <RadioGroup.Indicator className="absolute right-2 top-2">
                            <CheckCircleIcon className="size-6 rounded-full bg-white text-black" />
                          </RadioGroup.Indicator>
                        </RadioGroup.Item>
                      </div>
                    ))}
                  </RadioGroup.Root>
                </div>

                <div>
                  <p className="font-mono font-medium tracking-tight">
                    Describe your image
                  </p>
                  <div className="relative mt-2">
                    <textarea
                      name="prompt"
                      rows={6}
                      spellCheck={false}
                      placeholder="New York City..."
                      required
                      autoComplete="off"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="block w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 placeholder-gray-400 hover:border-gray-400/70 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-500"
                    />
                    {selectedLora && (
                      <div className="absolute inset-x-2 bottom-2 flex items-center">
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedLora.suggestions.map((suggestion, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setPrompt(suggestion.prompt)}
                              className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            >
                              {suggestion.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button
                  disabled={isFetching}
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-cyan-600 px-4 py-2 font-medium text-gray-100 shadow hover:bg-cyan-600/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50"
                >
                  <PictureIcon className="size-4" />
                  Generate Image
                </button>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="mx-auto flex h-full max-w-lg flex-col">
              <div className="mt-4 flex flex-col items-center">
                <a href="https://togetherai.link" target="_blank">
                  <Image alt="" className="h-8 w-auto" src={logo} />
                </a>
                <p className="font-mono text-gray-600">
                  Generate AI Images with LoRAs
                </p>
              </div>

              <div className="flex grow flex-col justify-center">
                <div>
                  {submittedPrompt && submittedLora && submittedSeed ? (
                    <AnimatePresence mode="wait">
                      {isFetching ? (
                        <motion.div
                          key="a"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            aspectRatio:
                              submittedLora?.width && submittedLora?.height
                                ? submittedLora.width / submittedLora.height
                                : 4 / 3,
                          }}
                          className="flex h-auto max-w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 shadow-sm"
                        >
                          <Spinner className="size-4" />
                          Generating...
                        </motion.div>
                      ) : data ? (
                        <motion.div
                          key="b"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Image
                            placeholder="blur"
                            blurDataURL={imagePlaceholder.blurDataURL}
                            width={submittedLora?.width ?? 1024}
                            height={submittedLora?.height ?? 768}
                            src={`data:image/png;base64,${data.image.b64_json}`}
                            alt=""
                            className={`${isFetching ? "animate-pulse" : ""} max-w-full rounded-lg border border-gray-200 object-cover shadow-sm`}
                          />
                          <div className="mt-2 text-center text-sm">
                            <p className="text-gray-700">
                              {submittedLora.name}
                            </p>
                            <p className="mt-1 text-gray-400">
                              {data.prompt}{" "}
                              <ShowCodeButton
                                submittedPrompt={submittedPrompt}
                                prompt={data.prompt}
                                lora={submittedLora}
                                seed={submittedSeed}
                              />
                            </p>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center">
                      <p className="text-balance px-4 text-center text-gray-500">
                        Choose from expertly crafted styles or bring your own
                        LoRA. Enter your prompt, select a style, and bring your
                        imagination to life.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </form>

      {/* <footer className="mt-16 w-full items-center pb-10 text-center text-xs text-gray-600 md:mt-4 md:flex md:justify-between md:pb-5">
        <p>
          Powered by{" "}
          <a
            href="https://togetherai.link"
            target="_blank"
            className="font-bold transition hover:text-blue-500"
          >
            Together.ai
          </a>
          ,{" "}
          <a
            href="https://huggingface.co/"
            target="_blank"
            className="font-bold transition hover:text-blue-500"
          >
            HuggingFace
          </a>
          , &{" "}
          <a
            href="https://togetherai.link/together-flux"
            target="_blank"
            className="font-bold transition hover:text-blue-500"
          >
            Flux
          </a>
        </p>

        <div className="mt-8 flex items-center justify-center md:mt-0 md:justify-between md:gap-6">
          <div className="flex gap-6 md:gap-2">
            <a href="https://github.com/Nutlope/loras-dev" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <GithubIcon className="size-4" />
                GitHub
              </Button>
            </a>
            <a href="https://x.com/nutlope" target="_blank">
              <Button
                size="sm"
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <XIcon className="size-3" />
                Twitter
              </Button>
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

function ShowCodeButton({
  submittedPrompt,
  prompt,
  lora,
  seed,
}: {
  submittedPrompt: string;
  prompt: string;
  lora: Lora;
  seed: number;
}) {
  const [isShowingDialog, setIsShowingDialog] = useState(false);
  const [language, setLanguage] = useState<"js" | "python">("js");

  const { data, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
    queryKey: [prompt, lora.model, seed],
    queryFn: async () => {
      let res = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          lora: lora.model,
          seed,
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      let json = await res.json();

      return codeResponseSchema.parse(json);
    },
    staleTime: Infinity,
    enabled: isShowingDialog,
    retry: false,
  });

  return (
    <Dialog open={isShowingDialog} onOpenChange={setIsShowingDialog}>
      <DialogTrigger className="text-cyan-600 underline">
        Show code
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Code sample</DialogTitle>
        <DialogDescription>
          Code used to generate "{submittedPrompt}"
        </DialogDescription>
        {isFetching ? (
          <Spinner />
        ) : data ? (
          <div className="overflow-hidden">
            <RadioGroup.Root
              className="flex items-center space-x-4 border-b"
              value={language}
              onValueChange={(value) => setLanguage(value as typeof language)}
            >
              <RadioGroup.Item
                value="js"
                className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-sm data-[state=checked]:border-gray-700"
              >
                <JavaScriptIcon />
                JavaScript
              </RadioGroup.Item>
              <RadioGroup.Item
                value="python"
                className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-sm data-[state=checked]:border-gray-700"
              >
                <PythonIcon />
                Python
              </RadioGroup.Item>
            </RadioGroup.Root>

            <div className="mt-4 space-y-3">
              <p>First, install the Together SDK:</p>

              <div
                dangerouslySetInnerHTML={{ __html: data[language].install }}
                className="overflow-x-auto rounded bg-[#0d1117] p-4 font-mono text-sm"
              />

              <p>Then set your API key</p>

              <div
                dangerouslySetInnerHTML={{ __html: data[language].apiKey }}
                className="overflow-x-auto rounded bg-[#0d1117] p-4 font-mono text-sm"
              />

              <p>Now you can use the code below to generate your image:</p>

              <div
                dangerouslySetInnerHTML={{ __html: data[language].example }}
                className="overflow-x-auto rounded bg-[#0d1117] p-4 font-mono text-sm"
              />

              <p>
                That's it! You should see the URL of your image printed on the
                screen.
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const imageResponseSchema = z.object({
  prompt: z.string(),
  image: z.object({
    b64_json: z.string(),
    timings: z.object({
      inference: z.number(),
    }),
  }),
});

const codeResponseSchema = z.object({
  js: z.object({
    install: z.string(),
    apiKey: z.string(),
    example: z.string(),
  }),
  python: z.object({
    install: z.string(),
    apiKey: z.string(),
    example: z.string(),
  }),
});
