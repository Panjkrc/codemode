<template>
  <TransitionRoot
    appear
    :show="show"
    class="flex flex-col h-full w-full content-center justify-center"
    enter="transition-all duration-500"
    enter-from="opacity-0 translate-x-96"
    enter-to="opacity-100 translate-y-0"
    leave="transition-all duration-500"
    leave-from="opacity-100"
    leave-to="opacity-0 -translate-x-96"
  >
    <div
      class="flex flex-col h-full w-1/4 content-center justify-center self-center gap-5 max-w-max px-5"
    >
      <p class="text-3xl text-brand-medium self-center font-bold">
        Please wait
      </p>
      <p>We are creating your account</p>
      <RefreshIcon
        class="w-10 h-10 rotate-180 animate-spin self-center text-brand-primary"
      />
    </div>
  </TransitionRoot>
  <TransitionRoot
    appear
    :show="registered"
    class="flex flex-col h-full w-full content-center justify-center"
    enter="transition-all duration-500"
    enter-from="opacity-0 translate-x-96"
    enter-to="opacity-100 translate-y-0"
    leave="transition-all duration-500"
    leave-from="opacity-100"
    leave-to="opacity-0 -translate-x-96"
  >
    <div
      class="flex flex-col h-full w-1/4 content-center justify-center self-center gap-5 max-w-max px-5"
    >
      <p class="text-3xl text-brand-medium self-center font-bold">
        You are all set!
      </p>
      <p class="">Continue to the Admin panel to start managing your team.</p>
      <button
        class="submit-button mt-5"
        @click="$router.push({ path: '/dashboard' })"
      >
        Go to dashboard ->
      </button>
    </div>
  </TransitionRoot>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useAdminOnboardingStore } from "@/stores/admin_onboarding.js";
import { RefreshIcon } from "@heroicons/vue/outline";
import { TransitionRoot } from "@headlessui/vue";

const adminOnboardingStore = useAdminOnboardingStore();

let registered = ref(adminOnboardingStore.registered);
let show = ref(false);

let register = async () => {
  try {
    await adminOnboardingStore.register();
    show.value = false;
    registered.value = true;
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  if (!registered.value) {
    show.value = true;
    await register();
  }
});
onBeforeUnmount(() => {
  show.value = false;
});
</script>
