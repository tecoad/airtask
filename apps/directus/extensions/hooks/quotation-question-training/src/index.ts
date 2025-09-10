import { defineHook } from "@directus/extensions-sdk";
import axios from "axios";
import { ENV } from "./config";

type UpdateInput = {
  is_example_valid?: boolean;
};

const client = axios.create({
  baseURL: ENV.api.url,
  auth: {
    username: ENV.api.username!,
    password: ENV.api.password!,
  },
});

export default defineHook(({ filter, action }) => {
  const exec = async (...params: any[]) => {
    const [input] = params;
    const data = input as UpdateInput;

    const secondParam = params[1];
    const id = secondParam.keys?.[0];

    if (secondParam.keys?.length > 1) {
      throw new Error("Only one item can be updated at a time");
    }

    const res = await client.post("/quotation-question-training/sync", {
      id,
      ...data,
    });

    return {
      ...data,
      ...res.data,
    };
  };

  filter("quotation_question_training.items.create", exec);
  filter("quotation_question_training.items.update", exec);
});
