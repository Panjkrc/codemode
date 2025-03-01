<template>
  <TransitionRoot
    appear
    :show="true"
    enter="transition-all duration-500"
    enter-from="opacity-0 translate-x-[100%]"
    enter-to="opacity-100 translate-y-0"
    leave="transition-all duration-500"
    leave-from="opacity-100"
    leave-to="opacity-0 -translate-x-96"
    class="overflow-y-auto justify-center flex"
  >
    <div
      class="grid grid-flow-col lg:grid-cols-6 py-10 grid-cols-1 gap-7 h-screen justify-center snap-parent xl:w-[60%] lg:w-[70%] md:w-[80%] sm:w-[90%] xs:w-[100%]"
    >
      <div v-if="show" class="lg:col-span-4 gap-7 flex flex-col pb-20">
        <div
          v-if="problem"
          class="flex flex-col bg-white py-2 px-4 rounded-lg border"
        >
          <div class="flex flex-col gap-5">
            <p
              class="link"
              @click="
                $router.push({ name: 'problem', params: { id: idea.problem } })
              "
            >
              &lt;- {{ problem.title }}
            </p>
          </div>
        </div>
        <IdeaPost :post="idea" />
        <div
          v-if="idea"
          class="border border-gray-200 bg-white rounded-lg h-min p-5 flex flex-col gap-1"
        >
          <div>
            <p class="text-sm text-gray-600">
              Comments ({{ idea.comment_count }})
            </p>

            <div v-if="!writingComment" @click="writingComment = true">
              <div class="relative col-span-2 w-full">
                <input
                  type="text"
                  placeholder="Write a comment"
                  class="form-input-style select-none"
                  maxlength="30"
                  disabled
                />
              </div>
            </div>

            <div v-if="writingComment" class="flex flex-col gap-2">
              <Tiptap v-model="comment" class="min-h-[1rem]" />
              <div class="flex flex-row gap-2">
                <button class="primary-button" @click="publishComment()">
                  Comment
                </button>
                <button
                  class="secondary-button"
                  @click="writingComment = false"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2 py-4">
              <CommentListing ref="comments" :post-id="idea._id" />
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="sticky hidden lg:flex flex-col h-min col-span-2 gap-4">
        <div
          v-if="userStore.user_data.is_admin"
          class="border-brand-primary border rounded-xl px-5 py-6 flex flex-col bg-white"
        >
          <p class="text-brand-dark text-base font-semibold text-center">
            Mark this idea as solution
          </p>
          <button></button>
        </div>
      </div> -->
    </div>
  </TransitionRoot>
</template>

<script setup>
import { TransitionRoot } from "@headlessui/vue";
import { getIdea } from "@/helpers/api/idea.js";
import { getProblem } from "@/helpers/api/problem.js";
import { useRoute, useRouter } from "vue-router";
import IdeaPost from "@/components/Posts/IdeaPost.vue";
import { computed, ref } from "vue";
import Tiptap from "@/components/Tiptap.vue";
import CommentListing from "@/components/Comments/CommentListing.vue";
import { postComment } from "@/helpers/api/comment.js";
import { errorToast, successToast } from "../../helpers/toast.js";
import { useUserStore } from "@/stores/user.js";
let userStore = useUserStore();

let route = useRoute();
let router = useRouter();

let idea = ref({});
let problem = ref({});

let show = ref(false);

let writingComment = ref(false);

let comment = ref("");
let comments = ref(null);

let timeLeft = computed(() => {
  let now = new Date();
  let deadline = new Date(idea.value.deadline);
  let timeDiff = deadline.getTime() - now.getTime();
  let seconds = Math.floor(timeDiff / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  hours %= 24;
  minutes %= 60;
  seconds %= 60;
  return `${days}d ${hours}h ${minutes}m`;
});

(async () => {
  try {
    let res = await getIdea(route.params.id);
    idea.value = res.data.idea;
    show.value = true;
  } catch (error) {
    if (error.response.status === 404) {
      router.push({
        name: "Error",
        params: {
          error_code: error.response.status,
          error_message: error.response.data.message,
        },
      });
    }
  }
  try {
    let res = await getProblem(idea.value.problem);
    problem.value = res.data.problem;
  } catch (error) {
    if (error.response.status === 404) {
      router.push({
        name: "Error",
        params: {
          error_code: error.response.status,
          error_message: error.response.data.message,
        },
      });
    }
  }
})();

let publishComment = async () => {
  try {
    if (!comment.value.length > 0) {
      return errorToast("Please enter a comment");
    }
    let res = await postComment({
      content: comment.value,
      level: 0,
      parent: idea.value._id,
    });
    comment.value = "";
    writingComment.value = false;
    successToast("Comment posted!");
    comments.value.refreshComments();
  } catch (error) {
    errorToast("Failed to post comment");
  }
};
</script>
