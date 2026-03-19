<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import Alimentos from "../data/produtosAlimentos.json"

import { Flame, PhoneCallIcon } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";
import Footer from "~/components/Layout/Footer.vue";
import { useCarrinho } from "~/data/composable/UseCarrinho";

const { carrinho, adicionarCarrinho } = useCarrinho()

</script>

<template>
    <div class="bg-red-400">

        <div v-for="C in carrinho">
            <img :src="C.img" alt=""> 
            oooi
        </div>
        

    </div>
</template>