
const template = `
<div class="crt-carousel-feed">
<div class="crt-carousel-stage" ref="stage">
<div class="crt-carousel-slider" ref="slider">

</div>
</div>

<button c-on:click="onPrevClick" type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>
<button c-on:click="onNextClick" type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>

</div>
`;

export default template;