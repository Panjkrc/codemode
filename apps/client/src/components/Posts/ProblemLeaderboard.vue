<template>
  <div
    v-if="topIdeas && topIdeas.length > 0"
    class="flex flex-col h-max justify-center items-center pt-5"
  >
    <div class="flex flex-col justify-center items-center">
      <p class="text-2xl text-brand-dark font-bold">LEADERBOARD</p>
      <p class="text-gray-700 text-sm">Top 3 ideas for this problem</p>
    </div>
    <div class="flex flex-col justify-center items-center gap-4 py-5 w-full ">
      <router-link
        v-for="idea in topIdeas"
        :key="idea._id"
        :to="{ name: 'idea', params: { id: idea._id } }"
         :class="{'border-amber-300 shadow-sm shadow-amber-300': topIdeas.indexOf(idea) == 0}"
        class="border border-gray-200 rounded-lg px-4 w-full flex flex-col py-4 justify-between gap-2"
       
      >
        <div class="flex flex-row gap-1 text-sm ">
          <div class="flex flex-row gap-[0.2rem] text-brand-dark">
            <UserCircleIcon
              v-if="!idea.created_by.profile_image"
              class="h-6 stroke-1"
            />
            <img
              v-else
              :src="idea.created_by.profile_image"
              class="rounded-full h-6 border border-brand-dark"
            />

            {{ idea.created_by.username }}
          </div>
          <p>•</p>
          <p>{{ formatDate(idea.created_at) }} ago</p>
          <p>•</p>
          <p>
            <span class="link">{{ idea.like_count }}</span> likes
          </p>
        </div>
        <hr />
        <div class="w-full flex flex-col">
          <p class="font-medium">{{ idea.title }}</p>
        </div>
      </router-link>
    </div>
  </div>
  <div v-else>
    <div class="text-center text-brand-dark font-medium">
      <p class="">There are no ideas for this problem yet.</p>
      <p>So the leaderboard is empty</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { UserCircleIcon } from "@heroicons/vue/outline";
import { getTopIdeas } from "@/helpers/api/problem.js";

let props = defineProps({
  id: String,
});

let topIdeas = ref([]);

let formatDate = (date) => {
  date = new Date(date);
  let now = new Date();
  let diff = now.getTime() - date.getTime();
  let days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let hours = Math.floor(diff / (1000 * 60 * 60));
  let minutes = Math.floor(diff / (1000 * 60));
  let seconds = Math.floor(diff / 1000);
  if (days > 0) {
    return days + "d";
  } else if (hours > 0) {
    return hours + "h";
  } else if (minutes > 0) {
    return minutes + "m";
  } else if (seconds > 0) {
    return seconds + "s";
  } else {
    return "now";
  }
};

(async () => {
  try {
    let res = await getTopIdeas(props.id);
    topIdeas.value = res.data.ideas;
    console.log(topIdeas.value);
  } catch (error) {
    console.log("");
  }
})();
</script>
