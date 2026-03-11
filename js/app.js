// ============================================================
// DrawingApp Web — Single-Page Application (Responsive)
// 12-column grid system from tokens.json
// ============================================================

let APP_DATA = null;
let INSPO_DATA = null;
let INSPO_BY_ID = new Map(); // id → item, built after load
const NAV_STACK = [];
let bookmarks = new Set(); // hydrated from localStorage below
let navBack = false; // true when navigating backward (triggers reverse slide animation)
let currentUser = null; // { name, email, photoInitials, photoColor }
let currentCatalogueTab = 'inspiration'; // persists active tab across re-renders of the saved page

// -- SVG Icons (Heroicons) ------------------------------------
const ICONS = {
  chevronLeft: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.71967 12.5303C7.42678 12.2374 7.42678 11.7626 7.71967 11.4697L15.2197 3.96967C15.5126 3.67678 15.9874 3.67678 16.2803 3.96967C16.5732 4.26256 16.5732 4.73744 16.2803 5.03033L9.31066 12L16.2803 18.9697C16.5732 19.2626 16.5732 19.7374 16.2803 20.0303C15.9874 20.3232 15.5126 20.3232 15.2197 20.0303L7.71967 12.5303Z" fill="currentColor"/></svg>',
  chevronRight: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2803 11.4697C16.5732 11.7626 16.5732 12.2374 16.2803 12.5303L8.78033 20.0303C8.48744 20.3232 8.01256 20.3232 7.71967 20.0303C7.42678 19.7374 7.42678 19.2626 7.71967 18.9697L14.6893 12L7.71967 5.03033C7.42678 4.73744 7.42678 4.26256 7.71967 3.96967C8.01256 3.67678 8.48744 3.67678 8.78033 3.96967L16.2803 11.4697Z" fill="currentColor"/></svg>',
  clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM12.75 6C12.75 5.58579 12.4142 5.25 12 5.25C11.5858 5.25 11.25 5.58579 11.25 6V12C11.25 12.4142 11.5858 12.75 12 12.75H16.5C16.9142 12.75 17.25 12.4142 17.25 12C17.25 11.5858 16.9142 11.25 16.5 11.25H12.75V6Z" fill="currentColor"/></svg>',
  clockOutline: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.75"/><path d="M12 6.75V12h4.5"/></svg>',
  search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 3.75C6.77208 3.75 3.75 6.77208 3.75 10.5C3.75 14.2279 6.77208 17.25 10.5 17.25C12.3642 17.25 14.0506 16.4953 15.273 15.273C16.4953 14.0506 17.25 12.3642 17.25 10.5C17.25 6.77208 14.2279 3.75 10.5 3.75ZM2.25 10.5C2.25 5.94365 5.94365 2.25 10.5 2.25C15.0563 2.25 18.75 5.94365 18.75 10.5C18.75 12.5078 18.032 14.3491 16.8399 15.7793L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L15.7793 16.8399C14.3491 18.032 12.5078 18.75 10.5 18.75C5.94365 18.75 2.25 15.0563 2.25 10.5Z" fill="currentColor"/></svg>',
  bookmark: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.75C10.137 3.75 8.29938 3.85779 6.49314 4.06741C5.78933 4.14909 5.25 4.76078 5.25 5.50699V19.7865L11.6646 16.5792C11.8757 16.4736 12.1243 16.4736 12.3354 16.5792L18.75 19.7865V5.50699C18.75 4.76078 18.2107 4.14909 17.5069 4.06741C15.7006 3.85779 13.863 3.75 12 3.75ZM6.32022 2.57741C8.18374 2.36114 10.079 2.25 12 2.25C13.921 2.25 15.8163 2.36114 17.6798 2.57741C19.1772 2.75119 20.25 4.03722 20.25 5.50699V21C20.25 21.2599 20.1154 21.5013 19.8943 21.638C19.6732 21.7746 19.3971 21.7871 19.1646 21.6708L12 18.0885L4.83541 21.6708C4.60292 21.7871 4.32681 21.7746 4.1057 21.638C3.88459 21.5013 3.75 21.2599 3.75 21V5.50699C3.75 4.03722 4.82283 2.75119 6.32022 2.57741Z" fill="currentColor"/></svg>',
  bookmarkFill: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.32022 2.57741C8.18374 2.36114 10.079 2.25 12 2.25C13.921 2.25 15.8163 2.36114 17.6798 2.57741C19.1772 2.75119 20.25 4.03722 20.25 5.50699V21C20.25 21.2599 20.1154 21.5013 19.8943 21.638C19.6732 21.7746 19.3971 21.7871 19.1646 21.6708L12 18.0885L4.83541 21.6708C4.60292 21.7871 4.32681 21.7746 4.1057 21.638C3.88459 21.5013 3.75 21.2599 3.75 21V5.50699C3.75 4.03722 4.82283 2.75119 6.32022 2.57741Z" fill="currentColor"/></svg>',
  play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 5.6527C4.5 4.22656 6.029 3.32251 7.2786 4.00979L18.8192 10.3571C20.1144 11.0695 20.1144 12.9306 18.8192 13.6429L7.2786 19.9902C6.029 20.6775 4.5 19.7735 4.5 18.3473V5.6527Z" fill="currentColor"/></svg>',
  pause: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12ZM9 8.25C8.58579 8.25 8.25 8.58579 8.25 9V15C8.25 15.4142 8.58579 15.75 9 15.75H9.75C10.1642 15.75 10.5 15.4142 10.5 15V9C10.5 8.58579 10.1642 8.25 9.75 8.25H9ZM14.25 8.25C13.8358 8.25 13.5 8.58579 13.5 9V15C13.5 15.4142 13.8358 15.75 14.25 15.75H15C15.4142 15.75 15.75 15.4142 15.75 15V9C15.75 8.58579 15.4142 8.25 15 8.25H14.25Z" fill="currentColor"/></svg>',
  replay: '\u21BA',
  gear: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.078 2.25C10.1614 2.25 9.37921 2.91265 9.22853 3.81675L9.04987 4.88873C9.02971 5.00964 8.93554 5.1498 8.75323 5.23747C8.40917 5.40292 8.07979 5.5938 7.76752 5.8076C7.60103 5.92159 7.43271 5.9332 7.31781 5.89015L6.29863 5.50833C5.44031 5.18678 4.47533 5.53289 4.01704 6.32666L3.09506 7.92358C2.63677 8.71736 2.81953 9.72611 3.52716 10.3087L4.36768 11.0006C4.46231 11.0785 4.53642 11.2298 4.52132 11.4307C4.50718 11.6188 4.5 11.8086 4.5 12C4.5 12.1915 4.50719 12.3814 4.52133 12.5695C4.53644 12.7704 4.46233 12.9217 4.3677 12.9996L3.52716 13.6916C2.81952 14.2741 2.63677 15.2829 3.09506 16.0767L4.01704 17.6736C4.47532 18.4674 5.44031 18.8135 6.29863 18.4919L7.31804 18.11C7.43293 18.067 7.60125 18.0786 7.76773 18.1925C8.07994 18.4063 8.40925 18.5971 8.75323 18.7625C8.93554 18.8502 9.02971 18.9904 9.04987 19.1113L9.22853 20.1832C9.37921 21.0874 10.1614 21.75 11.078 21.75H12.922C13.8386 21.75 14.6208 21.0874 14.7715 20.1832L14.9501 19.1113C14.9703 18.9904 15.0645 18.8502 15.2468 18.7625C15.5908 18.5971 15.9202 18.4062 16.2325 18.1924C16.399 18.0784 16.5673 18.0668 16.6822 18.1098L17.7014 18.4917C18.5597 18.8132 19.5247 18.4671 19.983 17.6733L20.9049 16.0764C21.3632 15.2826 21.1805 14.2739 20.4728 13.6913L19.6323 12.9994C19.5377 12.9215 19.4636 12.7702 19.4787 12.5693C19.4928 12.3812 19.5 12.1914 19.5 12C19.5 11.8085 19.4928 11.6186 19.4787 11.4305C19.4636 11.2296 19.5377 11.0783 19.6323 11.0004L20.4728 10.3084C21.1805 9.72587 21.3632 8.71711 20.9049 7.92334L19.983 6.32642C19.5247 5.53264 18.5597 5.18654 17.7014 5.50809L16.682 5.89C16.5671 5.93304 16.3987 5.92144 16.2323 5.80746C15.9201 5.59371 15.5907 5.40289 15.2468 5.23747C15.0645 5.1498 14.9703 5.00964 14.9501 4.88873L14.7715 3.81675C14.6208 2.91265 13.8386 2.25 12.922 2.25H11.078ZM12.0001 15.75C14.0712 15.75 15.7501 14.0711 15.7501 12C15.7501 9.92893 14.0712 8.25 12.0001 8.25C9.92905 8.25 8.25012 9.92893 8.25012 12C8.25012 14.0711 9.92905 15.75 12.0001 15.75Z" fill="currentColor"/></svg>',
  speaker: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13.5 4.06063C13.5 2.72427 11.8843 2.05501 10.9393 2.99996L6.43934 7.49997H4.50905C3.36772 7.49997 2.19106 8.16441 1.8493 9.40502C1.62147 10.2321 1.5 11.1024 1.5 12C1.5 12.8975 1.62147 13.7678 1.8493 14.5949C2.19106 15.8355 3.36772 16.5 4.50905 16.5H6.43934L10.9393 21C11.8843 21.9449 13.5 21.2757 13.5 19.9393V4.06063Z" fill="currentColor"/><path d="M18.5837 5.10561C18.8766 4.81272 19.3514 4.81272 19.6443 5.10561C23.452 8.91322 23.452 15.0866 19.6443 18.8942C19.3514 19.1871 18.8766 19.1871 18.5837 18.8942C18.2908 18.6013 18.2908 18.1264 18.5837 17.8335C21.8055 14.6117 21.8055 9.38809 18.5837 6.16627C18.2908 5.87338 18.2908 5.3985 18.5837 5.10561Z" fill="currentColor"/><path d="M15.9323 7.75734C16.2252 7.46445 16.7001 7.46445 16.993 7.75734C19.3361 10.1005 19.3361 13.8995 16.993 16.2426C16.7001 16.5355 16.2252 16.5355 15.9323 16.2426C15.6394 15.9497 15.6394 15.4749 15.9323 15.182C17.6897 13.4246 17.6897 10.5754 15.9323 8.818C15.6394 8.52511 15.6394 8.05024 15.9323 7.75734Z" fill="currentColor"/></svg>',
  book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 7C12 5.93913 11.5786 4.92172 10.8284 4.17157C10.0783 3.42143 9.06087 3 8 3H2V18H9C9.79565 18 10.5587 18.3161 11.1213 18.8787C11.6839 19.4413 12 20.2044 12 21M12 7V21M12 7C12 5.93913 12.4214 4.92172 13.1716 4.17157C13.9217 3.42143 14.9391 3 16 3H22V18H15C14.2044 18 13.4413 18.3161 12.8787 18.8787C12.3161 19.4413 12 20.2044 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2652 3.57578C12.1187 3.42933 11.8813 3.42933 11.7348 3.57578L5.25 10.0606V19.875C5.25 20.0821 5.41789 20.25 5.625 20.25H9V16.125C9 15.0894 9.83947 14.25 10.875 14.25H13.125C14.1605 14.25 15 15.0894 15 16.125V20.25H18.375C18.5821 20.25 18.75 20.0821 18.75 19.875V10.0606L12.2652 3.57578ZM20.25 11.5606L21.2197 12.5303C21.5126 12.8232 21.9874 12.8232 22.2803 12.5303C22.5732 12.2374 22.5732 11.7625 22.2803 11.4696L13.3258 2.51512C12.5936 1.78288 11.4064 1.78288 10.6742 2.51512L1.71967 11.4696C1.42678 11.7625 1.42678 12.2374 1.71967 12.5303C2.01256 12.8232 2.48744 12.8232 2.78033 12.5303L3.75 11.5606V19.875C3.75 20.9105 4.58947 21.75 5.625 21.75H18.375C19.4105 21.75 20.25 20.9105 20.25 19.875V11.5606ZM13.5 20.25H10.5V16.125C10.5 15.9178 10.6679 15.75 10.875 15.75H13.125C13.3321 15.75 13.5 15.9178 13.5 16.125V20.25Z" fill="currentColor"/></svg>',
  homeFill: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11.4697 3.84101C11.7626 3.54811 12.2374 3.54811 12.5303 3.84101L21.2197 12.5303C21.5126 12.8232 21.9874 12.8232 22.2803 12.5303C22.5732 12.2375 22.5732 11.7626 22.2803 11.4697L13.591 2.78035C12.7123 1.90167 11.2877 1.90167 10.409 2.78035L1.71967 11.4697C1.42678 11.7626 1.42678 12.2375 1.71967 12.5303C2.01256 12.8232 2.48744 12.8232 2.78033 12.5303L11.4697 3.84101Z" fill="currentColor"/><path d="M12 5.432L20.159 13.591C20.1887 13.6207 20.2191 13.6494 20.25 13.6772V19.875C20.25 20.9105 19.4105 21.75 18.375 21.75H15C14.5858 21.75 14.25 21.4142 14.25 21V16.5C14.25 16.0858 13.9142 15.75 13.5 15.75H10.5C10.0858 15.75 9.75 16.0858 9.75 16.5V21C9.75 21.4142 9.41421 21.75 9 21.75H5.625C4.58947 21.75 3.75 20.9106 3.75 19.875V13.6772C3.78093 13.6494 3.81127 13.6207 3.84099 13.591L12 5.432Z" fill="currentColor"/></svg>',
  rocketLaunch: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.315 7.58365C12.1956 3.88296 16.6946 1.50021 21.75 1.5C21.9489 1.49999 22.1397 1.57901 22.2803 1.71966C22.421 1.86031 22.5 2.05108 22.5 2.25C22.5 7.30564 20.1173 11.805 16.4165 14.6859C16.4715 15.0329 16.5 15.3883 16.5 15.75C16.5 19.4779 13.4779 22.5 9.75 22.5C9.33579 22.5 9 22.1642 9 21.75V17.6185C8.99075 17.6118 8.98163 17.6049 8.97264 17.5978C8.02063 16.8429 7.15799 15.9803 6.40312 15.0282C6.39577 15.019 6.38866 15.0096 6.38179 15H2.25C1.83579 15 1.5 14.6642 1.5 14.25C1.5 10.5221 4.52208 7.5 8.25 7.5C8.61198 7.5 8.96772 7.52856 9.315 7.58365ZM8.33141 9.00062C8.30433 9.00021 8.27719 9 8.25 9C5.60515 9 3.41709 10.9558 3.05317 13.5H6.45002C6.84367 11.8885 7.48512 10.3745 8.33141 9.00062ZM7.79354 14.361C8.35145 15.0312 8.96969 15.6494 9.63988 16.2073C11.6657 15.7902 13.5349 14.9427 15.1479 13.764C18.503 11.3124 20.7445 7.43269 20.9795 3.0205C16.5676 3.2557 12.6882 5.49727 10.2368 8.85223C9.05806 10.4654 8.21064 12.3349 7.79354 14.361ZM10.5 17.551V20.9468C13.0442 20.5829 15 18.3949 15 15.75C15 15.7231 14.9998 15.6963 14.9994 15.6696C13.6255 16.5159 12.1115 17.1574 10.5 17.551ZM15 8.25C14.5858 8.25 14.25 8.58579 14.25 9C14.25 9.41421 14.5858 9.75 15 9.75C15.4142 9.75 15.75 9.41421 15.75 9C15.75 8.58579 15.4142 8.25 15 8.25ZM12.75 9C12.75 7.75736 13.7574 6.75 15 6.75C16.2426 6.75 17.25 7.75736 17.25 9C17.25 10.2426 16.2426 11.25 15 11.25C13.7574 11.25 12.75 10.2426 12.75 9ZM5.41306 16.1923C5.66074 16.5243 5.59237 16.9942 5.26036 17.2419C4.34218 17.9269 3.75 19.0192 3.75 20.25C4.98081 20.25 6.07313 19.6578 6.75809 18.7396C7.00576 18.4076 7.47569 18.3393 7.8077 18.5869C8.13971 18.8346 8.20808 19.3045 7.9604 19.6365C7.00452 20.9179 5.47434 21.75 3.75 21.75C3.47445 21.75 3.20336 21.7287 2.93842 21.6875C2.61574 21.6374 2.36259 21.3843 2.31246 21.0616C2.27129 20.7966 2.25 20.5256 2.25 20.25C2.25 18.5257 3.08209 16.9955 4.36345 16.0396C4.69546 15.7919 5.16539 15.8603 5.41306 16.1923Z" fill="currentColor"/></svg>',
  rocketLaunchFill: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.315 7.58365C12.1956 3.88296 16.6946 1.50021 21.75 1.5C21.9489 1.49999 22.1397 1.57901 22.2803 1.71966C22.421 1.86031 22.5 2.05108 22.5 2.25C22.5 7.30564 20.1173 11.805 16.4165 14.6858C16.4715 15.0329 16.5 15.3883 16.5 15.75C16.5 19.4779 13.4779 22.5 9.75 22.5C9.33579 22.5 9 22.1642 9 21.75V17.6185C8.99075 17.6118 8.98163 17.6049 8.97264 17.5978C8.02063 16.8429 7.15799 15.9803 6.40312 15.0282C6.39577 15.019 6.38866 15.0096 6.38179 15H2.25C1.83579 15 1.5 14.6642 1.5 14.25C1.5 10.5221 4.52208 7.5 8.25 7.5C8.61198 7.5 8.96772 7.52856 9.315 7.58365ZM15 6.75C13.7574 6.75 12.75 7.75736 12.75 9C12.75 10.2426 13.7574 11.25 15 11.25C16.2426 11.25 17.25 10.2426 17.25 9C17.25 7.75736 16.2426 6.75 15 6.75Z" fill="currentColor"/><path d="M5.26036 17.2418C5.59237 16.9942 5.66074 16.5242 5.41306 16.1922C5.16539 15.8602 4.69546 15.7918 4.36345 16.0395C3.08209 16.9954 2.25 18.5256 2.25 20.2499C2.25 20.5255 2.27129 20.7966 2.31246 21.0615C2.36259 21.3842 2.61574 21.6373 2.93842 21.6875C3.20336 21.7286 3.47445 21.7499 3.75 21.7499C5.47434 21.7499 7.00452 20.9178 7.9604 19.6365C8.20808 19.3045 8.13971 18.8345 7.8077 18.5869C7.47569 18.3392 7.00577 18.4075 6.75809 18.7396C6.07313 19.6577 4.98081 20.2499 3.75 20.2499C3.75 19.0191 4.34218 17.9268 5.26036 17.2418Z" fill="currentColor"/></svg>',
  arrowRight: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2803 11.4697C16.5732 11.7626 16.5732 12.2374 16.2803 12.5303L8.78033 20.0303C8.48744 20.3232 8.01256 20.3232 7.71967 20.0303C7.42678 19.7374 7.42678 19.2626 7.71967 18.9697L14.6893 12L7.71967 5.03033C7.42678 4.73744 7.42678 4.26256 7.71967 3.96967C8.01256 3.67678 8.48744 3.67678 8.78033 3.96967L16.2803 11.4697Z" fill="currentColor"/></svg>'
};
ICONS.trophy = ICONS.rocketLaunchFill;

// -- Title Case Helper -----------------------------------------
function toTitleCase(str) {
  return str.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// -- Medium Tag Taxonomy Parser --------------------------------
/** Parse mediumTags strings into L0/L1/L2 levels for filtering and indexing. */
function parseMediumLevels(mediumTags) {
  const L0 = new Set(), L1 = new Set(), L2 = new Set();
  (mediumTags || []).forEach(tag => {
    const parts = tag.split('/').map(p => p.trim());
    if (parts[0]) L0.add(parts[0]);
    if (parts[1]) L1.add(parts[1]);
    if (parts[2]) L2.add(parts[2]);
  });
  return {
    L0: [...L0], L1: [...L1], L2: [...L2],
    all: [...L0, ...L1, ...L2],
  };
}

// -- Safe Data Loader ------------------------------------------
/** Fetch exercise + inspiration JSON with error handling. Returns true on success. */
async function loadAppData() {
  if (APP_DATA && INSPO_DATA) return true;
  try {
    const [exResp, inspoResp] = await Promise.all([
      fetch('data/exercises.json?v=4'),
      fetch('data/inspiration.json?v=4'),
    ]);
    if (!exResp.ok || !inspoResp.ok) throw new Error(`HTTP ${exResp.status}/${inspoResp.status}`);
    APP_DATA = await exResp.json();
    INSPO_DATA = await inspoResp.json();

    // Backward-compat: if old nested format, flatten to array
    if (INSPO_DATA && !Array.isArray(INSPO_DATA) && INSPO_DATA.sections) {
      INSPO_DATA = INSPO_DATA.sections.flatMap(s => s.items);
    }

    // Build lookup map and pre-parse medium taxonomy levels
    INSPO_BY_ID = new Map();
    if (Array.isArray(INSPO_DATA)) {
      INSPO_DATA.forEach(item => {
        item._mediumParsed = parseMediumLevels(item.metadata?.mediumTags);
        INSPO_BY_ID.set(item.id, item);
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to load app data:', err);
    // Show user-facing error on whatever page is active
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      activePage.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:12px;">⚠</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:8px;">Unable to load content</div>
          <div style="font-size:14px;color:#666;margin-bottom:20px;">Check your connection and try again.</div>
          <button class="pressable" style="padding:10px 24px;border-radius:8px;background:#1a1a1a;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;" onclick="location.reload()">Retry</button>
        </div>`;
    }
    return false;
  }
}

// -- Safe Image URL ----------------------------------------
/**
 * Encodes problematic characters in local image file paths so browsers
 * fetch the correct file. Handles three real failure cases found in the data:
 *   1. Literal '%' in filenames (e.g. Hewll%27s...) — browser decodes %XX → 404.
 *      Fix: escape % first so browser sees the literal character.
 *   2. '#' in filenames (e.g. martian 8-16#2 copy.jpg) — browser treats as
 *      fragment delimiter and truncates the URL → 404.
 *   3. Spaces in filenames — unreliable in CSS background-image url().
 * Does NOT touch http:// URLs (CDN/remote assets handle their own encoding).
 */
function safeImgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url; // remote URLs left as-is
  return url
    .replace(/%/g, '%25')  // must be first — preserve literal % in filenames
    .replace(/ /g, '%20')  // spaces → %20 (safe in both CSS and HTML)
    .replace(/#/g, '%23'); // # → %23 (prevents fragment truncation)
}

// -- Media URL Resolver ----------------------------------------
function resolveMedia(url) {
  if (!url || !url.trim()) return null;
  const u = url.trim();

  // YouTube: youtube.com/watch?v=ID  or  youtu.be/ID
  const yt = u.match(/(?:youtube\.com\/watch\?(?:[^#&]*&)*v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };

  // Vimeo: vimeo.com/ID  or  vimeo.com/video/ID
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vm[1]}?dnt=1` };

  // Instagram post or reel
  const ig = u.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  if (ig) return { type: 'instagram', embedUrl: `https://www.instagram.com/p/${ig[1]}/embed/` };

  // Local / direct video file
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u)) return { type: 'video', src: u };

  // Direct image URL
  if (/\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(u)) return { type: 'image', src: u };

  // Generic fallback — treat as embeddable iframe
  return { type: 'iframe', src: u };
}

// -- Firebase Setup -------------------------------------------
const _fbApp = firebase.initializeApp({ projectId: 'drawingapp-test', apiKey: 'demo-key', authDomain: 'localhost' });
const fbAuth = firebase.auth();
const fbDb   = firebase.firestore();
fbAuth.useEmulator('http://127.0.0.1:9099');
fbDb.useEmulator('127.0.0.1', 8081);

/** Derive a consistent avatar colour from a display name */
function nameToColor(name) {
  const palette = ['#5f6368','#8e8e93','#636363','#4a4a4a','#3d6b4f','#4a6b9d','#7b4a6b','#6b4a3d','#4a6b3d','#6b6b3d'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

/** Fetch the Firestore user doc and populate the global currentUser object */
async function loadUserProfile(uid, fallbackEmail) {
  try {
    const snap = await fbDb.collection('users').doc(uid).get();
    if (snap.exists) {
      const d = snap.data();
      currentUser = {
        uid,
        name: d.displayName || fallbackEmail,
        email: d.email || fallbackEmail,
        photoInitials: (d.displayName || fallbackEmail || '?').slice(0, 2).toUpperCase(),
        photoColor: nameToColor(d.displayName || fallbackEmail)
      };
      return;
    }
  } catch (e) { console.warn('loadUserProfile error:', e); }
  // Fallback if Firestore doc missing
  const name = (fallbackEmail || 'User').split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  currentUser = { uid, name, email: fallbackEmail || '', photoInitials: name.slice(0, 2).toUpperCase(), photoColor: '#8e8e93' };
}

// -- Auth -----------------------------------------------------
function checkAuth() {
  // Kept for legacy compatibility — real auth now uses Firebase onAuthStateChanged
  return !!currentUser;
}

const AUTH_CAROUSEL_IMAGES = [
  'assets/img/tumblr_nd3o27REhj1ra91zio1_1280.jpg',
  'assets/img/1614152_10203543292536207_6489644832389594662_o.jpg',
  'assets/img/mark_kent_01.jpg',
  'assets/img/10710223_809415889115246_6808983344493792334_o.jpg',
  'assets/img/AssassinC.jpg',
  'assets/img/10974246_950385621638961_5407060400643747288_o.jpg',
  'assets/img/10572045_832768963409491_6802551560604276290_o.jpg',
  'assets/img/MANTIS.jpg',
  'assets/img/10355510_10204597464632148_5833762416026191611_o.jpg',
  'assets/img/240061_833109710078805_3199452003204821838_o.jpg',
  'assets/img/1458428_833001802629_1722916089_n.jpg',
];

function renderAuth() {
  const el = document.getElementById('page-auth');
  // Duplicate images for seamless infinite scroll
  const allImgs = [...AUTH_CAROUSEL_IMAGES, ...AUTH_CAROUSEL_IMAGES];
  const imgHTML = allImgs.map(src => `
    <div class="auth-carousel__item">
      <img src="${src}" alt="" loading="lazy" />
    </div>`).join('');

  el.innerHTML = `
    <div class="auth-nav">
      <button class="auth-nav__back pressable" onclick="navigateTo('page-home', renderHome)" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="auth-nav__links">
        <button class="auth-nav__link pressable" onclick="navigateTo('page-home', renderHome)">Home</button>
        <button class="auth-nav__link pressable" onclick="navigateTo('page-inspo', renderForYou)">Inspo</button>
      </div>
    </div>
    <div class="auth-brand">
      <div class="auth-carousel">
        <div class="auth-carousel__track" id="auth-carousel-track">
          ${imgHTML}
        </div>
      </div>
    </div>
    <div class="auth-card">
      <div class="auth-card__inner">
        <div>
          <img class="auth-card__logo" src="assets/img/logo-horizontal.png" alt="InspoAcademy" />
          <div class="auth-card__title">Unlimited inspiration awaits.</div>
          <div class="auth-card__sub">Sign in for full access to inspiration, creative habits, and exercises to improve.</div>
        </div>

        <button class="google-btn pressable" id="google-signin-btn" onclick="signInWithGoogle()">
          <svg class="google-btn__icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          <span class="google-btn__text">Continue with Google</span>
        </button>

        <div class="auth-divider">or</div>

        <div style="display:flex;flex-direction:column;gap:10px">
          <label for="auth-email" class="sr-only">Email address</label>
          <input class="auth-email-input" type="email" id="auth-email" placeholder="Email address" autocomplete="email" aria-label="Email address"/>
          <button class="auth-continue-btn pressable" onclick="signInWithEmail()">Continue</button>
          <div class="auth-magic-link-row">Forgot your password? <button class="auth-magic-link pressable" onclick="openMagicLinkModal()">Use a magic link</button></div>
        </div>

        <div class="auth-footer">
          By continuing you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  `;
}

async function signInWithGoogle() {
  const btn = document.getElementById('google-signin-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = `<div class="google-btn__spinner"></div><span class="google-btn__text">Signing in\u2026</span>`;
  try {
    // Try Firebase emulator first (no real Google OAuth in local dev)
    await fbAuth.signInWithEmailAndPassword('alex.beginner@test.drawingapp.com', 'testpass123');
    // onAuthStateChanged will call bootAuthenticatedApp() — nothing else needed here
  } catch (err) {
    // Emulator unavailable — use a demo session so the prototype always works
    console.warn('Firebase emulator unavailable, using demo session:', err.message);
    currentUser = {
      uid: 'demo-user',
      name: 'Alex Chen',
      email: 'alex.beginner@test.drawingapp.com',
      photoInitials: 'AC',
      photoColor: '#5e5ce6'
    };
    if (!_authBootDone) {
      _authBootDone = true;
      await loadData();
    } else {
      await bootAuthenticatedApp();
    }
  }
}

async function signInWithEmail() {
  const emailEl = document.getElementById('auth-email');
  const email = emailEl?.value.trim();
  if (!email) { showAuthError('Please enter your email address.'); return; }

  const btn = document.querySelector('.auth-continue-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in\u2026'; }

  try {
    await fbAuth.signInWithEmailAndPassword(email, 'testpass123');
    // onAuthStateChanged handles the rest
  } catch (err) {
    console.error('Email sign-in error:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Continue'; }
    const msg = err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential'
      ? 'No account found for that email. Try: alex.beginner@test.drawingapp.com'
      : 'Sign-in failed. Check your email and try again.';
    showAuthError(msg);
  }
}

function showAuthError(msg) {
  let el = document.getElementById('auth-error-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'auth-error-msg';
    el.style.cssText = 'color:#e53935;font-size:13px;margin-top:8px;text-align:center;';
    document.querySelector('.auth-card__inner')?.appendChild(el);
  }
  el.textContent = msg;
  setTimeout(() => { if (el) el.textContent = ''; }, 5000);
}

function openMagicLinkModal() {
  if (document.getElementById('otp-modal-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'otp-modal-overlay';
  overlay.className = 'otp-modal-overlay';
  overlay.innerHTML = `
    <div class="otp-modal" role="dialog" aria-modal="true">
      <h2 class="otp-modal__title">Enter the one time verification code we have sent you</h2>
      <p class="otp-modal__body">You should receive a code shortly to the email or phone number you provided.</p>
      <input class="otp-modal__input" type="text" id="otp-input" placeholder="Enter code" maxlength="8" inputmode="numeric" autocomplete="one-time-code"/>
      <div class="otp-modal__actions">
        <button class="otp-modal__verify pressable" id="otp-verify-btn" onclick="verifyOTP()">Verify</button>
        <button class="otp-modal__cancel pressable" onclick="closeMagicLinkModal()">Cancel</button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeMagicLinkModal(); });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.getElementById('otp-input')?.focus();
}

function closeMagicLinkModal() {
  const overlay = document.getElementById('otp-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

async function verifyOTP() {
  const input = document.getElementById('otp-input');
  const btn = document.getElementById('otp-verify-btn');
  if (!input || !input.value.trim()) return;
  btn.disabled = true;
  btn.textContent = 'Verifying\u2026';
  // In emulator mode, any code triggers sign-in as the email entered
  const email = document.getElementById('auth-email')?.value.trim() || 'alex.beginner@test.drawingapp.com';
  try {
    await fbAuth.signInWithEmailAndPassword(email, 'testpass123');
    closeMagicLinkModal();
    // onAuthStateChanged handles the rest
  } catch (err) {
    console.error('OTP sign-in error:', err);
    btn.disabled = false;
    btn.textContent = 'Verify';
    const errEl = document.querySelector('.otp-modal');
    if (errEl) {
      let e = errEl.querySelector('.otp-error');
      if (!e) { e = document.createElement('div'); e.className = 'otp-error'; e.style.cssText='color:#e53935;font-size:13px;margin-top:8px;'; errEl.appendChild(e); }
      e.textContent = 'Code not accepted. Use a test email to sign in.';
    }
  }
}

async function bootAuthenticatedApp() {
  // Render the global avatar pill now that we have a user
  renderGlobalAvatar();

  // Transition auth → home skeleton
  const authPage = document.getElementById('page-auth');
  const homeEl = document.getElementById('page-home');
  homeEl.innerHTML = getSkeleton('page-home');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  void homeEl.offsetHeight;
  homeEl.classList.add('active');
  updateBottomNavActive('page-home');
  window.scrollTo(0, 0);

  // Fetch data (first load) and render home
  const ok = await loadAppData();
  if (ok) requestAnimationFrame(() => renderHome());
}

async function signOut() {
  // Sign out of Firebase first (clears IndexedDB session)
  try { await fbAuth.signOut(); } catch (e) { console.warn('Firebase signOut error:', e); }

  currentUser = null;
  localStorage.removeItem('da_user');

  // Clear the global avatar
  const pill = document.getElementById('global-user-pill');
  if (pill) { pill.innerHTML = ''; pill.classList.remove('visible'); }

  // Stop any active media / timers and clean up global state
  cleanupPageState();
  if (typeof stopVideo === 'function') stopVideo();
  if (typeof clearForYouTimers === 'function') clearForYouTimers();
  NAV_STACK.length = 0;

  // Slide back to auth page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  renderAuth();
  const authPage = document.getElementById('page-auth');
  authPage.classList.add('page-back');
  void authPage.offsetHeight;
  authPage.classList.add('active');
  updateBottomNavActive('page-auth');
  window.scrollTo(0, 0);
}

// -- Global floating avatar -----------------------------------
function renderGlobalAvatar() {
  const container = document.getElementById('global-user-pill');
  if (!container || !currentUser) return;

  container.innerHTML = `
    <button class="user-pill__avatar pressable"
            style="background:${currentUser.photoColor}"
            onclick="toggleUserMenu(event)"
            aria-label="Account menu">${currentUser.photoInitials}</button>
    <div class="user-menu" id="user-menu" role="menu">
      <button class="user-menu__item pressable" onclick="closeUserMenu(); navigateTo('page-account', renderAccount)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Account
      </button>
      <button class="user-menu__item pressable" onclick="closeUserMenu(); navigateTo('page-preferences', renderPreferences)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Preferences
      </button>
      <div class="user-menu__divider"></div>
      <button class="user-menu__item user-menu__item--danger pressable" onclick="closeUserMenu(); signOut()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Log Out
      </button>
    </div>
  `;
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  closeUserMenu();
  if (!isOpen) {
    menu.classList.add('open');
    // Close when clicking anywhere outside
    setTimeout(() => document.addEventListener('click', closeUserMenu, { once: true }), 0);
  }
}

function closeUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.remove('open');
}

function toggleHomeUserMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('home-user-menu');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  closeHomeUserMenu();
  if (!isOpen) {
    menu.classList.add('open');
    setTimeout(() => document.addEventListener('click', closeHomeUserMenu, { once: true }), 0);
  }
}

function closeHomeUserMenu() {
  const menu = document.getElementById('home-user-menu');
  if (menu) menu.classList.remove('open');
}

// -- Data Loading ---------------------------------------------
async function loadData() {
  // Load data for all users — home panels are the landing page for everyone
  const homeEl = document.getElementById('page-home');
  homeEl.innerHTML = getSkeleton('page-home');
  // Clear any previously active page (e.g. auth page) before activating home
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  homeEl.classList.add('active');
  updateBottomNavActive('page-home');

  const ok = await loadAppData();
  if (!ok) return;

  // Populate the global avatar pill if the user is already authenticated
  if (currentUser) renderGlobalAvatar();

  renderHome();
  updateBottomNavActive('page-home');
}

// -- Navigation -----------------------------------------------
/** Release heavyweight global state from the page we're leaving. */
function cleanupPageState() {
  // Coach image data (can be multi-MB base64)
  window._coachImageBase64 = null;
  window._coachImagePreview = null;
  // Generated plan
  window._generatedPlan = null;
  // Search/browse results stored for modals
  window._inspoResults = null;
  window._exerciseResults = null;
  window._exerciseCatLookup = null;
  // Modal helpers
  window._inspoModalCurrent = null;
  window._inspoModalRender = null;
  // Close any open modals
  closeGenPlanModal();
  closeInspoModal();
  closeHamburgerMenu();
  // Remove For You overlay elements (sidebar + CTA) appended to body
  document.querySelectorAll('.inspo-sidebar, .inspo-create-account').forEach(n => n.remove());
}

function navigateTo(pageId, renderFn, data) {
  // Clean up heavyweight state from previous page
  cleanupPageState();
  // Stop carousel auto-scroll when leaving home
  if (heroCarouselState) { heroCarouselState.stop(); heroCarouselState = null; }
  closeUserMenu();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  NAV_STACK.push({ pageId, renderFn, data });

  const page = document.getElementById(pageId);
  if (page) {
    // Instantly paint skeleton so there's no blank flash
    const skel = getSkeleton(pageId);
    if (skel) page.innerHTML = skel;

    // Set slide direction (back = slide from left, forward = slide from right)
    page.classList.toggle('page-back', navBack);
    void page.offsetHeight; // force reflow to restart CSS animation
    page.classList.add('active');
    window.scrollTo(0, 0);
  }

  // Render real content on next frame — data is already in-memory so this
  // is near-instant; the slide animation (220ms) continues uninterrupted
  requestAnimationFrame(() => {
    if (renderFn) renderFn(data);
    navBack = false;
  });

  updateBottomNavActive(pageId);
  updateBottomNavVisibility(pageId);
}

function goBack() {
  cleanupPageState();
  NAV_STACK.pop();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (NAV_STACK.length > 0) {
    const prev = NAV_STACK[NAV_STACK.length - 1];
    if (prev.renderFn) prev.renderFn(prev.data);
    const page = document.getElementById(prev.pageId);
    if (page) {
      page.classList.add('page-back');  // slide in from left for back navigation
      void page.offsetHeight;            // restart animation
      page.classList.add('active');
    }
    updateBottomNavActive(prev.pageId);
    updateBottomNavVisibility(prev.pageId);
  } else {
    renderHome();
    const homeEl = document.getElementById('page-home');
    homeEl.classList.add('page-back');
    void homeEl.offsetHeight;
    homeEl.classList.add('active');
    updateBottomNavActive('page-home');
    updateBottomNavVisibility('page-home');
  }
}

// -- Skeleton Screens ------------------------------------------
function getSkeleton(pageId) {
  // Reusable skeleton pieces
  const navBar = `
    <div class="skel-nav">
      <div class="skel" style="width:28px;height:28px;border-radius:50%"></div>
      <div class="skel" style="width:120px;height:16px"></div>
    </div>`;
  const row = (thumbW, thumbH, lines = 2) => `
    <div class="skel-row" style="padding:12px 0;border-bottom:1px solid #f0f0f2">
      <div class="skel" style="width:${thumbW}px;height:${thumbH}px;border-radius:6px;flex-shrink:0"></div>
      <div class="skel-col">
        <div class="skel" style="height:14px;width:65%"></div>
        ${lines > 1 ? '<div class="skel" style="height:12px;width:45%"></div>' : ''}
      </div>
    </div>`;

  switch (pageId) {
    case 'page-home':
      return `
        <div class="skel" style="width:100%;height:380px;border-radius:0"></div>
        <div class="skel-pad" style="gap:16px;padding:20px 16px">
          <div class="skel" style="height:16px;width:55%"></div>
          <div class="skel-scroll-row">
            ${[160,160,160].map(w => `<div class="skel" style="width:${w}px;height:100px;flex-shrink:0;border-radius:8px"></div>`).join('')}
          </div>
          <div class="skel" style="height:16px;width:45%"></div>
          <div class="skel-scroll-row">
            ${[160,160,160].map(w => `<div class="skel" style="width:${w}px;height:100px;flex-shrink:0;border-radius:8px"></div>`).join('')}
          </div>
        </div>`;

    case 'page-exercises':
      return `
        ${navBar}
        <div class="skel-pad" style="padding:20px 16px;gap:14px">
          <div class="skel" style="height:40px;width:70%"></div>
          <div class="skel" style="height:14px;width:50%"></div>
          <div class="skel" style="height:96px;border-radius:12px"></div>
          <div style="margin-top:8px">
            ${[1,2,3].map(() => row(72, 72)).join('')}
          </div>
        </div>`;

    case 'page-search':
      return `
        ${navBar}
        <div class="skel-pad" style="padding:16px;gap:14px">
          <div class="skel" style="height:44px;border-radius:10px"></div>
          <div class="skel-row" style="gap:8px;flex-wrap:wrap">
            ${[80,70,90,75,65].map(w => `<div class="skel" style="width:${w}px;height:32px;border-radius:16px"></div>`).join('')}
          </div>
          <div class="skel" style="height:16px;width:40%"></div>
          ${[1,2,3,4].map(() => row(60, 60)).join('')}
        </div>`;

    case 'page-search-results':
      return `
        ${navBar}
        <div class="skel-pad" style="padding:16px;gap:14px">
          <div class="skel-row" style="gap:8px">
            ${[80,70,90].map(w => `<div class="skel" style="width:${w}px;height:28px;border-radius:16px"></div>`).join('')}
          </div>
          <div class="skel" style="height:14px;width:35%"></div>
          <div class="skel" style="height:16px;width:45%"></div>
          <div class="skel-scroll-row">
            ${[140,140,140].map(() => `<div class="skel" style="width:140px;height:100px;flex-shrink:0;border-radius:8px"></div>`).join('')}
          </div>
          <div class="skel" style="height:16px;width:40%"></div>
          ${[1,2,3].map(() => row(60, 60)).join('')}
        </div>`;

    case 'page-inspo-all':
      return `
        ${navBar}
        <div class="skel-pad" style="padding:16px;gap:12px">
          <div class="search-results__grid">
            ${[1,2,3,4,5,6].map(() => `<div class="skel" style="width:100%;aspect-ratio:4/3;border-radius:8px"></div>`).join('')}
          </div>
        </div>`;

    case 'page-exercises-all':
      return `
        ${navBar}
        <div class="skel-pad" style="padding:16px;gap:12px">
          ${[1,2,3,4,5,6].map(() => row(60, 60)).join('')}
        </div>`;

    case 'page-catalogue':
      return `
        ${navBar}
        <div class="skel-pad" style="padding:16px;gap:12px">
          <div class="skel" style="height:13px;width:120px"></div>
          ${[1,2,3].map(() => row(56, 56)).join('')}
        </div>`;

    case 'page-inspo':
      return `
        <div class="inspo-feed">
          <div class="inspo-card">
            <div class="inspo-card__container">
              <div class="skel" style="width:100%;height:100%;border-radius:0;position:absolute;inset:0"></div>
            </div>
          </div>
        </div>`;

    case 'page-video':
      return `
        <div class="video-page-inner">
          <div class="video-area">
            <div class="skel" style="width:100%;height:100%;border-radius:0"></div>
          </div>
          <div class="skel-pad" style="padding:16px;gap:14px">
            <div class="skel" style="height:14px;width:60%"></div>
            <div class="skel" style="height:12px;width:40%"></div>
            <div class="skel" style="height:4px;border-radius:2px"></div>
          </div>
        </div>`;

    case 'page-detail':
      return `
        ${navBar}
        <div class="skel" style="width:100%;height:300px;border-radius:0"></div>
        <div class="skel-pad" style="padding:20px 16px;gap:12px">
          <div class="skel" style="height:28px;width:70%"></div>
          <div class="skel" style="height:14px;width:40%"></div>
          <div class="skel" style="height:1px;width:100%;background:#f0f0f2"></div>
          <div class="skel" style="height:14px;width:55%"></div>
          <div class="skel" style="height:14px;width:80%"></div>
          <div class="skel" style="height:14px;width:60%"></div>
          <div class="skel" style="height:50px;border-radius:10px;margin-top:12px"></div>
        </div>`;

    case 'page-article':
      return `
        ${navBar}
        <div class="skel" style="width:100%;height:200px;border-radius:0"></div>
        <div class="skel-pad" style="padding:20px 16px;gap:12px">
          <div class="skel" style="height:24px;width:75%"></div>
          <div class="skel" style="height:14px;width:50%"></div>
          ${[1,2,3].map(() => `<div class="skel" style="height:14px;width:${70 + Math.random() * 25 | 0}%"></div>`).join('')}
        </div>`;

    case 'page-auth':
      return `
        <div style="display:flex;flex-direction:column;min-height:100vh">
          <div class="skel-pad" style="flex:1;padding:48px 32px;gap:16px;background:var(--color-surface-bg)">
            <div class="skel" style="width:48px;height:48px;border-radius:8px"></div>
            <div class="skel" style="height:32px;width:60%"></div>
            <div class="skel" style="height:14px;width:75%"></div>
          </div>
          <div class="skel-pad" style="flex:1;padding:48px 32px;gap:14px">
            <div class="skel" style="height:26px;width:45%"></div>
            <div class="skel" style="height:14px;width:70%"></div>
            <div class="skel" style="height:48px;border-radius:4px"></div>
            <div class="skel" style="height:48px;border-radius:8px"></div>
            <div class="skel" style="height:48px;border-radius:8px"></div>
          </div>
        </div>`;

    case 'page-account':
      return `
        <div class="settings-page">
          ${navBar}
          <div class="skel-pad" style="align-items:center;padding:32px 16px 24px;gap:12px">
            <div class="skel" style="width:72px;height:72px;border-radius:50%"></div>
            <div class="skel" style="height:20px;width:140px"></div>
          </div>
          <div class="skel-pad" style="padding:0 16px 24px;gap:10px">
            <div class="skel" style="height:11px;width:60px"></div>
            <div class="skel" style="height:50px;border-radius:var(--r-lg)"></div>
            <div class="skel" style="height:50px;border-radius:var(--r-lg)"></div>
            <div class="skel" style="height:50px;border-radius:var(--r-lg)"></div>
          </div>
        </div>`;

    case 'page-preferences':
      return `
        <div class="settings-page">
          ${navBar}
          <div class="skel-pad" style="padding:24px 16px;gap:20px">
            <div class="skel" style="height:11px;width:120px"></div>
            <div class="skel-row" style="gap:8px;flex-wrap:wrap">
              ${[120,70,80,100,60].map(w => `<div class="skel" style="width:${w}px;height:34px;border-radius:17px"></div>`).join('')}
            </div>
            <div class="skel" style="height:11px;width:140px"></div>
            <div style="display:flex;flex-direction:column;gap:2px">
              ${[1,2,3].map(() => `<div class="skel" style="height:44px;border-radius:var(--r-md)"></div>`).join('')}
            </div>
            <div class="skel" style="height:11px;width:100px"></div>
            <div style="display:flex;flex-direction:column;gap:2px">
              ${[1,2,3].map(() => `<div class="skel" style="height:44px;border-radius:var(--r-md)"></div>`).join('')}
            </div>
          </div>
        </div>`;

    default:
      return '';
  }
}

// -- Hero Email Signup ----------------------------------------
function handleHeroEmailSignup() {
  const input = document.querySelector('.hero-slide__email-input');
  const email = input ? input.value.trim() : '';
  navigateTo('page-auth', renderAuth);
  if (email) {
    setTimeout(() => {
      const authEmail = document.getElementById('auth-email');
      if (authEmail) authEmail.value = email;
    }, 100);
  }
}

// -- Bottom Nav Bar -------------------------------------------
function handleBottomNav(tab) {
  closeUserMenu();
  stopVideo();
  clearForYouTimers();
  // Remove For You overlay elements when switching tabs
  document.querySelectorAll('.inspo-sidebar, .inspo-create-account').forEach(n => n.remove());
  NAV_STACK.length = 0;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  switch (tab) {
    case 'inspo':
      navigateTo('page-inspo', renderForYou);
      return;
    case 'home':
      renderHome();
      document.getElementById('page-home').classList.add('active');
      updateBottomNavActive('page-home');
      break;
    case 'exercises':
      if (!currentUser) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-exercises').classList.add('active');
        renderAssignmentsGate();
        return;
      }
      navigateTo('page-exercises', renderExerciseList);
      return;
    case 'search':
      searchChips = [];
      navigateTo('page-search', renderSearch);
      return;
    case 'catalogue':
      if (!currentUser) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-catalogue').classList.add('active');
        renderCatalogueGate();
        return;
      }
      navigateTo('page-catalogue', renderCatalogue);
      return;
  }
  window.scrollTo(0, 0);
  updateBottomNavVisibility('');
}

function updateBottomNavActive(pageId) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const mapping = {
    'page-auth':        '',            // no active tab on auth page
    'page-inspo':      'inspo',
    'page-home':        'home',
    'page-exercises':   'exercises',
    'page-search':      'search',
    'page-search-results': 'search',
    'page-inspo-all':   'search',
    'page-exercises-all': 'search',
    'page-catalogue':   'catalogue',
    'page-detail':      'exercises',
    'page-video':       'exercises',
    'page-account':     '',
    'page-preferences': '',
  };
  const activeTab = Object.prototype.hasOwnProperty.call(mapping, pageId) ? mapping[pageId] : 'home';
  nav.querySelectorAll('.bottom-nav__item').forEach(item => {
    item.classList.toggle('active', activeTab !== '' && item.dataset.page === activeTab);
  });
  // Hide bottom nav: unauth mobile (hamburger replaces it), unauth home/saved always, unauth foryou at tablet+
  const isMobileUnauth = !currentUser && window.innerWidth < 768;
  const hideNav = isMobileUnauth || (!currentUser && (pageId === 'page-home' || pageId === 'page-catalogue' || pageId === 'page-exercises' || pageId === 'page-search' || (pageId === 'page-inspo' && window.innerWidth >= 768)));
  nav.style.display = hideNav ? 'none' : '';

  // Dark nav only for unauthenticated users on foryou — authenticated always uses light nav
  const isDarkNav = !currentUser && pageId === 'page-inspo';
  nav.classList.toggle('bottom-nav--dark', isDarkNav);

  // Show global avatar on all pages when authenticated, except:
  //   page-auth  — the login screen, no user yet
  //   page-home  — has its own welcome auth bar with the avatar
  const noAvatarPages = new Set(['page-auth', 'page-home']);
  const pill = document.getElementById('global-user-pill');
  if (pill) pill.classList.toggle('visible', !!currentUser && !noAvatarPages.has(pageId));

  // Sync hamburger nav state (unauthenticated mobile)
  updateHamburgerNav(pageId);
}

// updateBottomNavVisibility is a no-op — CSS handles nav visibility via sibling selectors.
// Kept as a named stub so callsites don't need to be removed.
function updateBottomNavVisibility(_pageId) {}

// -- Hamburger Menu (Unauthenticated Mobile) ------------------
let hamburgerMenuOpen = false;

function renderHamburgerNavItems(activeTab) {
  const container = document.getElementById('hamburger-nav-items');
  if (!container) return;
  const items = [
    { tab: 'inspo', icon: ICONS.rocketLaunch, label: 'Inspo' },
    { tab: 'home',        icon: ICONS.home,         label: 'Home' },
    { tab: 'search',      icon: ICONS.search,       label: 'Browse' },
    { tab: 'catalogue',   icon: ICONS.bookmark,     label: 'Catalogue' },
    { tab: 'exercises', icon: ICONS.book,          label: 'Exercises' },
  ];
  container.innerHTML = items.map(it => `
    <button class="hamburger-nav__item pressable${it.tab === activeTab ? ' active' : ''}"
            data-tab="${it.tab}"
            onclick="handleHamburgerNav('${it.tab}')">
      ${it.icon}
      <span>${it.label}</span>
    </button>
  `).join('') + `
    <button class="hamburger-nav__cta-inline pressable"
            onclick="closeHamburgerMenu(); navigateTo('page-auth', renderAuth)">
      Create Account
    </button>`;
}

function toggleHamburgerMenu() {
  if (hamburgerMenuOpen) closeHamburgerMenu();
  else openHamburgerMenu();
}

function openHamburgerMenu() {
  hamburgerMenuOpen = true;
  const nav = document.getElementById('hamburger-nav');
  if (!nav) return;
  nav.querySelector('.hamburger-nav__overlay').classList.add('hamburger-nav__overlay--visible');
  nav.querySelector('.hamburger-nav__drawer').classList.add('hamburger-nav__drawer--open');
  document.body.style.overflow = 'hidden';
}

function closeHamburgerMenu() {
  hamburgerMenuOpen = false;
  const nav = document.getElementById('hamburger-nav');
  if (!nav) return;
  nav.querySelector('.hamburger-nav__overlay').classList.remove('hamburger-nav__overlay--visible');
  nav.querySelector('.hamburger-nav__drawer').classList.remove('hamburger-nav__drawer--open');
  document.body.style.overflow = '';
}

function handleHamburgerNav(tab) {
  closeHamburgerMenu();
  handleBottomNav(tab);
}

function updateHamburgerNav(pageId) {
  const nav = document.getElementById('hamburger-nav');
  if (!nav) return;

  // Only show for unauthenticated users
  const shouldShow = !currentUser;
  // Hide on auth, account, preferences pages
  const hiddenPages = new Set(['page-auth', 'page-account', 'page-preferences']);
  if (!shouldShow || hiddenPages.has(pageId)) {
    nav.style.display = 'none';
    return;
  }
  nav.style.display = '';

  // Login button visible on homepage and saved gate
  const loginBtn = nav.querySelector('.hamburger-nav__login');
  if (loginBtn) {
    loginBtn.style.display = (pageId === 'page-home' || pageId === 'page-catalogue' || pageId === 'page-exercises' || pageId === 'page-search') ? '' : 'none';
  }

  // Map pageId to active tab
  const mapping = {
    'page-inspo': 'inspo', 'page-home': 'home',
    'page-exercises': 'exercises', 'page-search': 'search',
    'page-search-results': 'search', 'page-inspo-all': 'search',
    'page-exercises-all': 'search', 'page-catalogue': 'catalogue',
    'page-detail': 'exercises', 'page-video': 'exercises',
  };
  renderHamburgerNavItems(mapping[pageId] || '');

  // Dark variant for pages with dark hero backgrounds
  const darkPages = new Set(['page-inspo', 'page-home', 'page-catalogue', 'page-exercises', 'page-search']);
  nav.classList.toggle('hamburger-nav--dark', darkPages.has(pageId));
}

// Close hamburger on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && hamburgerMenuOpen) closeHamburgerMenu();
});

// Re-evaluate nav on resize (mobile ↔ tablet)
window.addEventListener('resize', () => {
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    updateBottomNavActive(activePage.id);
  }
});

// -- For You Auto-Scroll --------------------------------------
let forYouState = { timer: null, settleTimer: null, currentIndex: 0 };

function startForYouAutoScroll() {
  clearForYouTimers();
  forYouState.currentIndex = 0;
  const page = document.getElementById('page-inspo');
  if (!page) return;
  page.addEventListener('scroll', onForYouScroll, { passive: true });
  forYouState.timer = setTimeout(advanceForYou, 5000);
}

function onForYouScroll() {
  // User scrolled manually — reset countdown once snap settles
  clearTimeout(forYouState.timer);
  clearTimeout(forYouState.settleTimer);
  forYouState.settleTimer = setTimeout(() => {
    const page = document.getElementById('page-inspo');
    if (!page || !page.classList.contains('active')) return;
    forYouState.currentIndex = Math.round(page.scrollTop / page.clientHeight);
    forYouState.timer = setTimeout(advanceForYou, 5000);
  }, 400);
}

function advanceForYou() {
  const page = document.getElementById('page-inspo');
  if (!page || !page.classList.contains('active')) return;
  const total = page.querySelectorAll('.inspo-card').length;
  const next = forYouState.currentIndex + 1;
  if (next >= total) return; // stop at last card
  forYouState.currentIndex = next;
  page.scrollTo({ top: next * page.clientHeight, behavior: 'smooth' });
  forYouState.timer = setTimeout(advanceForYou, 5000);
}

function clearForYouTimers() {
  clearTimeout(forYouState.timer);
  clearTimeout(forYouState.settleTimer);
  forYouState.currentIndex = 0;
  const page = document.getElementById('page-inspo');
  if (page) page.removeEventListener('scroll', onForYouScroll);
}

// -- For You: Likes + Saved Inspiration -----------------------
const LIKED_KEY        = 'da_liked_items';
const SAVED_INSPO_KEY  = 'da_saved_inspiration';  // tag-variant / inspiration cards
const SAVED_ASSIGN_KEY = 'da_saved_assignments';  // exercise / assignment cards

function getLikedItems()       { try { return JSON.parse(localStorage.getItem(LIKED_KEY)        || '{}'); } catch { return {}; } }
function getSavedInspo()       { try { return JSON.parse(localStorage.getItem(SAVED_INSPO_KEY)  || '[]'); } catch { return []; } }
function getSavedAssignments() { try { return JSON.parse(localStorage.getItem(SAVED_ASSIGN_KEY) || '[]'); } catch { return []; } }

// Cached ID sets — avoids re-parsing localStorage on every For You scroll render
let _cachedSavedInspoIds  = null;
let _cachedSavedAssignIds = null;
function getCachedInspoIds()  { if (!_cachedSavedInspoIds)  _cachedSavedInspoIds  = new Set(getSavedInspo().map(s => s.id));  return _cachedSavedInspoIds; }
function getCachedAssignIds() { if (!_cachedSavedAssignIds) _cachedSavedAssignIds = new Set(getSavedAssignments().map(s => s.id)); return _cachedSavedAssignIds; }
function invalidateSavedCaches() { _cachedSavedInspoIds = null; _cachedSavedAssignIds = null; }

function toggleForYouLike(exId, exTitle, catTitle, categoryTag) {
  const liked = getLikedItems();
  const btn = document.getElementById('fy-like-' + exId);
  if (liked[exId]) {
    delete liked[exId];
    if (btn) btn.classList.remove('fy-action--liked');
  } else {
    liked[exId] = { id: exId, title: exTitle, category: catTitle, categoryTag, likedAt: Date.now() };
    if (btn) btn.classList.add('fy-action--liked');
  }
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
}

/**
 * Toggle a For You feed bookmark.
 * @param {string} type  'assignment' — exercise/drill card  |  'inspiration' — tag-variant card
 */
function toggleForYouBookmark(exId, exTitle, catTitle, catId, duration, type) {
  const isAssignment = type === 'assignment';
  const storageKey   = isAssignment ? SAVED_ASSIGN_KEY : SAVED_INSPO_KEY;
  const saved        = isAssignment ? getSavedAssignments() : getSavedInspo();

  const idx = saved.findIndex(s => s.id === exId);
  const btn = document.getElementById('fy-bm-' + exId);

  if (idx > -1) {
    saved.splice(idx, 1);
    if (btn) btn.classList.remove('fy-action--saved');
  } else {
    // Resolve imageUrl from INSPO_BY_ID so saved items always carry their image
    // (renderCatalogue falls back to this when FY_TAG_CARDS hasn't been rebuilt yet)
    const inspoRef = (!isAssignment && INSPO_BY_ID) ? INSPO_BY_ID.get(exId) : null;
    const imageUrl = inspoRef?.imageUrl || null;
    saved.unshift({ id: exId, title: exTitle, category: catTitle, catId, duration, type, imageUrl, savedAt: Date.now() });
    if (btn) btn.classList.add('fy-action--saved');
  }

  localStorage.setItem(storageKey, JSON.stringify(saved));
  invalidateSavedCaches();

  // Live-refresh the saved page if it's currently open
  if (document.getElementById('page-catalogue')?.classList.contains('active')) {
    renderCatalogue();
  }
}

// -- For You Page ---------------------------------------------
// -- For You: Tag-Variant Card Data ---------------------------

/**
 * Fisher-Yates in-place shuffle — true random, O(n).
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build FY_TAG_CARDS from the enriched inspirationSections data.
 * Each inspiration item becomes a tag-variant card with real metadata tags.
 * Bonus cards use remaining images not assigned to inspiration items.
 */
function buildInspirationCards() {
  const cards = [];
  if (Array.isArray(INSPO_DATA)) {
    INSPO_DATA.forEach(item => {
      const m = item.metadata || {};
      const parsed = item._mediumParsed || parseMediumLevels(m.mediumTags);
      const tags = [
        ...(m.industry || []).slice(0, 1),
        ...parsed.L2.slice(0, 1),
        ...(m.subjectMatter || []).slice(0, 1),
        ...(m.techniqueVisible || []).slice(0, 1),
        ...(m.colorPalette || []).slice(0, 1),
      ];
      cards.push({
        id: item.id,
        imageUrl: item.imageUrl || '',
        title: item.title,
        subtitle: item.subtitle,
        section: parsed.L1[0] || parsed.L0[0] || 'Inspiration',
        tags: [...new Set(tags)].slice(0, 5),
      });
    });
  }
  return cards;
}

let FY_TAG_CARDS = [];

/** Return the metadata-derived tags for an inspiration card by its index */
function pickTagsForCard(cardIndex) {
  if (!FY_TAG_CARDS.length) FY_TAG_CARDS = buildInspirationCards();
  const card = FY_TAG_CARDS[cardIndex % FY_TAG_CARDS.length];
  return card ? card.tags : [];
}

function renderForYou() {
  const el = document.getElementById('page-inspo');

  // Dark background only for unauthenticated users
  el.classList.toggle('inspo-page--dark', !currentUser);

  // Flatten all exercises across all categories
  const allItems = [];
  if (APP_DATA && APP_DATA.categories) {
    APP_DATA.categories.forEach(cat => {
      cat.exercises.forEach(ex => allItems.push({ type: 'exercise', ex, cat }));
    });
  }

  // Build inspiration cards from data (rebuild each render to ensure APP_DATA is loaded)
  // Shuffle a copy so the source array stays intact for other uses (bookmarks, etc.)
  FY_TAG_CARDS = shuffleArray(buildInspirationCards());

  // Shuffle exercises too so the same cards don't always lead the feed
  shuffleArray(allItems);

  // Interleave tag-variant (inspiration) cards: insert one after every 2nd exercise card
  const combined = [];
  let tagIdx = 0;
  allItems.forEach((item, i) => {
    combined.push(item);
    if ((i + 1) % 2 === 0 && tagIdx < FY_TAG_CARDS.length) {
      combined.push({ type: 'tag', card: FY_TAG_CARDS[tagIdx++] });
    }
  });
  // Append any remaining inspiration cards
  while (tagIdx < FY_TAG_CARDS.length) {
    combined.push({ type: 'tag', card: FY_TAG_CARDS[tagIdx++] });
  }

  // Preference-weighted sort: score inspo cards against user prefs
  const prefTerms = new Set([
    ...(PREFS.artStyles || []).map(s => s.toLowerCase()),
    ...(PREFS.careerGoals || []).map(s => s.toLowerCase()),
  ]);
  combined.forEach(item => {
    if (item.type !== 'tag' || !prefTerms.size) { item._ps = 0; return; }
    let score = 0;
    (item.card.tags || []).forEach(t => {
      const tl = t.toLowerCase();
      for (const pref of prefTerms) {
        if (tl === pref) score += 3;
        else if (tl.includes(pref) || pref.includes(tl)) score += 1;
      }
    });
    item._ps = score;
  });
  // Assign a stable random key once per item so the tiebreaker is consistent
  // (calling Math.random() inside a comparator produces biased sorts)
  combined.forEach(item => { item._r = Math.random(); });
  combined.sort((a, b) => (b._ps - a._ps) || (a._r - b._r));

  // Placeholder background colours cycling through a warm palette
  const palettes = [
    '#c9cdd4', '#b8bfc9', '#d4cec9', '#c4cfc4',
    '#cdc4c4', '#c4c9cd', '#cdc9c4', '#c4cdc9',
  ];

  const isAuthed       = !!currentUser;
  const liked          = getLikedItems();
  const savedInspoIds  = getCachedInspoIds();
  const savedAssignIds = getCachedAssignIds();

  // Sidebar nav for unauthenticated users (visible at tablet+ via CSS)
  const sidebarHtml = !currentUser ? `
    <nav class="inspo-sidebar">
      <button class="inspo-sidebar__link pressable" onclick="handleBottomNav('inspo')">
        ${ICONS.rocketLaunch}
        <span>Inspo</span>
      </button>
      <button class="inspo-sidebar__link pressable" onclick="handleBottomNav('home')">
        ${ICONS.home}
        <span>Home</span>
      </button>
      <button class="inspo-sidebar__link pressable" onclick="handleBottomNav('search')">
        ${ICONS.search}
        <span>Browse</span>
      </button>
      <button class="inspo-sidebar__link pressable" onclick="handleBottomNav('catalogue')">
        ${ICONS.bookmark}
        <span>Catalogue</span>
      </button>
      <button class="inspo-sidebar__link pressable" onclick="handleBottomNav('exercises')">
        ${ICONS.book}
        <span>Exercises</span>
      </button>
      <button class="inspo-sidebar__login pressable" onclick="navigateTo('page-auth', renderAuth)">Login</button>
    </nav>` : '';

  // Remove any previous For You overlay elements (sidebar + CTA)
  document.querySelectorAll('.inspo-sidebar, .inspo-create-account').forEach(n => n.remove());

  // Append sidebar and CTA to body (outside scroll container) so position:fixed works
  if (!currentUser) {
    const sidebarEl = document.createElement('div');
    sidebarEl.innerHTML = sidebarHtml;
    if (sidebarEl.firstElementChild) document.body.appendChild(sidebarEl.firstElementChild);

    const ctaEl = document.createElement('div');
    ctaEl.innerHTML = `<button class="inspo-create-account pressable" onclick="navigateTo('page-auth', renderAuth)">Create Account</button>`;
    if (ctaEl.firstElementChild) document.body.appendChild(ctaEl.firstElementChild);
  }

  el.innerHTML = `
    <div class="inspo-feed">
      ${combined.map((item, i) => {

        // ── Tag-variant (inspiration) card ───────────────────
        if (item.type === 'tag') {
          const { card } = item;
          const tags     = card.tags || [];
          const tagLiked = !!liked[card.id];
          const tagSaved = savedInspoIds.has(card.id);  // checks da_saved_inspiration
          const cardTitle = (card.title || '').replace(/'/g, "\\'");
          const cardSection = (card.section || 'Inspiration').replace(/'/g, "\\'");
          return `
          <div class="inspo-card inspo-card--tag-variant pressable"
               style="--card-bg:${palettes[i % palettes.length]}"
               onclick="openInspoModal('${card.imageUrl}')">
            <div class="inspo-card__container">
              <div class="inspo-card__media"
                   style="background-image:url('${safeImgUrl(card.imageUrl)}');background-size:cover;background-position:center top;"></div>
              <div class="inspo-card__tag-overlay">
                <div></div>
                <div class="inspo-card__tags">
                  ${tags.map(t => `<span class="inspo-card__tag">${toTitleCase(t)}</span>`).join('')}
                </div>
              </div>
              ${isAuthed ? `<div class="inspo-card__actions">
                <button
                  id="fy-like-${card.id}"
                  class="inspo-card__action-btn pressable${tagLiked ? ' fy-action--liked' : ''}"
                  onclick="event.stopPropagation(); toggleForYouLike('${card.id}', '${cardTitle}', '${cardSection}', 'TAG')"
                  aria-label="Like">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button
                  id="fy-bm-${card.id}"
                  class="inspo-card__action-btn pressable${tagSaved ? ' fy-action--saved' : ''}"
                  onclick="event.stopPropagation(); toggleForYouBookmark('${card.id}', '${cardTitle}', '${cardSection}', '', '', 'inspiration')"
                  aria-label="Save">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>` : ''}
            </div>
          </div>`;
        }

        // ── Standard exercise / assignment card ───────────────
        const { ex, cat } = item;
        const fyMedia = resolveMedia(ex.imageUrl || null);
        const fyMediaStyle = (fyMedia && fyMedia.type === 'image')
          ? `background-image:url('${fyMedia.src}');background-size:cover;background-position:center;`
          : '';
        const isLiked = !!liked[ex.id];
        const isSaved = savedAssignIds.has(ex.id);  // checks da_saved_assignments
        const exTitle  = ex.title.replace(/'/g, "\\'");
        const catTitle = cat.title.replace(/'/g, "\\'");
        return `
        <div class="inspo-card pressable"
             style="--card-bg:${palettes[i % palettes.length]}"
             onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })">
          <div class="inspo-card__container">
            <div class="inspo-card__media" style="${fyMediaStyle}"></div>
            <div class="inspo-card__overlay">
              <div class="inspo-card__eyebrow">${cat.title}</div>
              <div class="inspo-card__title">${ex.title}</div>
              <div class="inspo-card__meta">${ex.duration}&nbsp;&nbsp;·&nbsp;&nbsp;${ex.categoryTag}</div>
            </div>
            ${isAuthed ? `<div class="inspo-card__actions">
              <button
                id="fy-like-${ex.id}"
                class="inspo-card__action-btn pressable${isLiked ? ' fy-action--liked' : ''}"
                onclick="event.stopPropagation(); toggleForYouLike('${ex.id}', '${exTitle}', '${catTitle}', '${ex.categoryTag}')"
                aria-label="Like">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button
                id="fy-bm-${ex.id}"
                class="inspo-card__action-btn pressable${isSaved ? ' fy-action--saved' : ''}"
                onclick="event.stopPropagation(); toggleForYouBookmark('${ex.id}', '${exTitle}', '${catTitle}', '${cat.id}', '${ex.duration}', 'assignment')"
                aria-label="Save">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>` : ''}
          </div>
        </div>
      `;
      }).join('')}
    </div>
  `;

  startForYouAutoScroll();
}

// -- Hero Carousel Data ----------------------------------------
const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Alexandre_Cabanel_-_Fallen_Angel.jpg/960px-Alexandre_Cabanel_-_Fallen_Angel.jpg',
    title: 'Create Like the Masters in a Digital Era',
    subtitle: "Learn how to think, plan, build, and create like the old master's",
    cta: 'Start Exercises',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(135deg, #2d1b33 0%, #4a1942 50%, #6b2d5e 100%)',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/_p_qMfnQvnY?autoplay=1&mute=1&start=42&loop=1&playlist=_p_qMfnQvnY&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0',
    title: 'Explore Light & Shadow',
    subtitle: 'Understand form through value studies',
    cta: 'Browse Lessons',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(135deg, #0d2b1d 0%, #1a4a2e 50%, #2d7a4f 100%)',
    imageUrl: null,
    title: 'Perspective Fundamentals',
    subtitle: 'From one-point to complex architectural space',
    cta: 'View All',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(135deg, #1e1a0e 0%, #3d3010 50%, #7a5f1a 100%)',
    imageUrl: null,
    title: 'Anatomy for Artists',
    subtitle: 'Learn the underlying structures that give figures life',
    cta: 'Start Learning',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(135deg, #1a0d0d 0%, #3d1010 50%, #7a1f1f 100%)',
    imageUrl: null,
    title: 'Daily Drawing Habits',
    subtitle: 'Short, focused exercises to keep your skills sharp',
    cta: 'See Exercises',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(135deg, #0d1a2e 0%, #102040 50%, #1a3a6e 100%)',
    imageUrl: null,
    title: 'Composition & Design',
    subtitle: 'Create drawings that guide the eye and tell a story',
    cta: 'Explore',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #4a4a4a 100%)',
    imageUrl: null,
    title: 'Texture & Detail',
    subtitle: 'Add depth and tactility to every surface you draw',
    cta: 'Get Started',
    action: "navigateTo('page-exercises', renderExerciseList)"
  }
];

// -- Authenticated Dashboard ----------------------------------

/** 5-slide hero carousel shown at the top of the authenticated home page.
 *  imageUrl is intentionally null — images will be provided and added later.
 *  action should deep-link to the relevant Exercise Detail Page URL. */
const AUTH_HERO_SLIDES = [
  {
    bg: 'linear-gradient(160deg, #1c1c1e 0%, #2c2c2e 100%)',
    title: 'Technical Warm-Ups',
    subtitle: 'Intentionally selecting movements and motions that are directly related to the amount of control you have over your drawing utensil. Let\'s build a good warm-up foundation.',
    cta: 'Start Exercise',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
    title: 'Line Control & Weight',
    subtitle: 'Being able to control your lines, from the first mark to the last gives sketches the energy and emotion you always wanted to achieve.',
    cta: 'Start Exercise',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(160deg, #0d2b1d 0%, #1a3d2b 100%)',
    title: 'Circles & Ellipses',
    subtitle: 'Freehanded circles and ellipses can be one of the most challenging tasks in drawing and ellipses are more frequent in everyday life than you\'d imagine.',
    cta: 'Start Exercise',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(160deg, #1a0d1a 0%, #2d1040 100%)',
    title: 'Perspective & Horizon Lines',
    subtitle: 'Through a series of simple exercises you will gain the ability to create the point of view for any scene and build visual depth for your subject matter.',
    cta: 'Start Exercise',
    action: "navigateTo('page-exercises', renderExerciseList)"
  },
  {
    bg: 'linear-gradient(160deg, #1e1209 0%, #3a2010 100%)',
    title: 'Facial Proportions & Angles',
    subtitle: 'There are a number of different methods to quickly capture the general facial proportions to gain a level of realism.',
    cta: 'Start Exercise',
    action: "navigateTo('page-exercises', renderExerciseList)"
  }
];

const SCIFI_CARDS = [
  { id: 'ROBO-0030', title: 'Alien Warship in Clouds',       img: 'assets/img/Robotic/468317_10151381351501500_1926628378_o.jpg' },
  { id: 'ROBO-0043', title: 'Alien Spacecraft Hangar',        img: 'assets/img/Robotic/711_max.jpg' },
  { id: 'ROBO-0012', title: 'Stealth Warship Concept',        img: 'assets/img/Robotic/218_max.jpg' },
  { id: 'ROBO-0013', title: 'Gunship Turntable Sketches',     img: 'assets/img/Robotic/245_max.jpg' },
  { id: 'ROBO-0020', title: 'G9 Kaizer Kraft Gunship',        img: 'assets/img/Robotic/335268_435888909796467_1614448021_o.jpg' },
  { id: 'ROBO-0047', title: 'Medivac Dropship',               img: 'assets/img/Robotic/768_max.jpg' },
  { id: 'ROBO-0054', title: 'Spacecraft in Neon Blue Hangar', img: 'assets/img/Robotic/859_max.jpg' },
  { id: 'ROBO-0055', title: 'Monochrome Spacecraft Sketch',   img: 'assets/img/Robotic/861_max.jpg' },
  { id: 'ROBO-0063', title: 'Dark Sci-Fi Warship Concept',    img: 'assets/img/Robotic/921556_10151381351596500_773507791_o.jpg' },
  { id: 'ROBO-0066', title: 'Starship Assembly Bay',          img: 'assets/img/Robotic/952_max.jpg' },
  { id: 'ROBO-0082', title: 'Flak Mech — Quadruped Walker',   img: 'assets/img/Robotic/another_flak_mech_by_progv-d3kg8df.jpg' },
  { id: 'ROBO-0089', title: 'UAF Army Giant Mech Walkers',    img: 'assets/img/Robotic/gallery_student_intro_to_design_pg2_30.jpg' },
];

const PRODUCTS_WE_LOVE = [
  { title: 'Staedtler Mars Lumograph', body: 'Professional drawing pencils for precise lines and shading', color: '#e8e4dc' },
  { title: 'Strathmore 400 Series',    body: 'Premium drawing paper with a smooth, consistent surface', color: '#dce4e8' },
  { title: 'Prismacolor Premier',      body: 'Rich, creamy colour pencils with superior blending', color: '#e4dce8' },
  { title: 'Micron Pigma Pens',        body: 'Archival ink pens perfect for detail work and inking', color: '#dce8e0' },
  { title: 'Kneaded Eraser',           body: 'Pliable eraser for soft highlights and smudge control', color: '#e8e0dc' },
  { title: 'Copic Sketch Markers',     body: 'Refillable alcohol markers loved by pros worldwide', color: '#e0e8dc' },
];

function getCompletedExercises() {
  try { return JSON.parse(localStorage.getItem('da_completed') || '[]'); } catch { return []; }
}

// Opens the shared inspo lightbox seeded with the Sci-Fi carousel items
function openScifiModal(index) {
  window._inspoResults = SCIFI_CARDS.map(c => ({
    id:            c.id,
    title:         c.title,
    subtitle:      'Sci-Fi Inspiration',
    imageUrl:      c.img,
    _sectionTitle: 'Sci-Fi Inspiration'
  }));
  openInspoModal(index);
}

function renderAuthHome() {
  const el = document.getElementById('page-home');
  const firstName = currentUser.name.split(' ')[0];

  // Auth bar
  const authBar = `
    <div class="home-auth-bar">
      <span class="home-auth-bar__welcome">Welcome, ${firstName}</span>
      <div class="home-auth-bar__avatar-wrap">
        <button class="home-auth-bar__avatar pressable"
                style="background:${currentUser.photoColor}"
                onclick="toggleHomeUserMenu(event)"
                aria-label="Account menu">${currentUser.photoInitials}</button>
        <div class="user-menu" id="home-user-menu" role="menu">
          <button class="user-menu__item pressable" onclick="closeHomeUserMenu(); navigateTo('page-account', renderAccount)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Account
          </button>
          <button class="user-menu__item pressable" onclick="closeHomeUserMenu(); navigateTo('page-preferences', renderPreferences)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Preferences
          </button>
          <div class="user-menu__divider"></div>
          <button class="user-menu__item user-menu__item--danger pressable" onclick="closeHomeUserMenu(); signOut()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Out
          </button>
        </div>
      </div>
    </div>`;

  // Section 3 data
  const savedExercises = [];
  if (APP_DATA && APP_DATA.categories) {
    APP_DATA.categories.forEach(cat => {
      cat.exercises.forEach(ex => {
        if (bookmarks.has(ex.id)) savedExercises.push({ ex, cat });
      });
    });
  }
  const savedThree = savedExercises.slice(0, 3);
  const completedThree = getCompletedExercises().slice(0, 3);

  const exerciseListItem = (title, meta, onclick, extraClass = '', showCta = false) => `
    <div class="dash-ex-item${extraClass ? ' ' + extraClass : ''} pressable" onclick="${onclick}">
      <div class="dash-ex-item__content">
        <div class="dash-ex-item__title">${title}</div>
        <div class="dash-ex-item__meta">${meta}</div>
      </div>
      ${showCta
        ? `<button class="dash-ex-item__cta pressable" onclick="event.stopPropagation(); ${onclick}">Start Now</button>`
        : `<svg class="dash-ex-item__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`}
    </div>`;

  const savedPanel = savedThree.length > 0
    ? savedThree.map(({ ex, cat }) =>
        exerciseListItem(ex.title, `${cat.title} · ${ex.duration}`,
          `navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })`))
        .join('') + (savedExercises.length > 3 ? `<button class="dash-view-all pressable" onclick="handleBottomNav('catalogue')">View all ${savedExercises.length} saved</button>` : '')
    : `<div class="dash-empty"><p>No saved exercises yet.</p><button class="dash-empty__cta pressable" onclick="handleBottomNav('exercises')">Browse</button></div>`;

  // Suggested exercises for the "Start" empty state — first 5 from APP_DATA
  const suggestedFive = [];
  if (APP_DATA && APP_DATA.categories) {
    outer: for (const cat of APP_DATA.categories) {
      for (const ex of cat.exercises) {
        suggestedFive.push({ ex, cat });
        if (suggestedFive.length >= 5) break outer;
      }
    }
  }

  const completedPanel = completedThree.length > 0
    ? completedThree.map(item =>
        exerciseListItem(item.title, item.meta || item.category || '',
          `navigateTo('page-exercises', renderExerciseList)`))
        .join('')
    : suggestedFive.map(({ ex, cat }) =>
        exerciseListItem(
          ex.title,
          `${cat.title} · ${ex.duration}`,
          `navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })`,
          'dash-ex-item--suggest',
          true
        )).join('');

  el.innerHTML = `
    ${authBar}
    <div class="dash">

      <!-- Section 1: Hero Carousel -->
      <section class="dash-section dash-section--flush">
        <div class="dash-hero">
          <div class="home-hero-carousel__track-wrap" id="dash-hero-track-wrap">
            <div class="home-hero-carousel__track" id="dash-hero-track">
              ${AUTH_HERO_SLIDES.map((slide, i) => `
                <div class="hero-slide" style="background:${slide.bg}">
                  <div class="hero-slide__content">
                    <div class="hero-slide__title">${slide.title}</div>
                    <div class="hero-slide__subtitle">${slide.subtitle}</div>
                    <button class="hero-slide__cta pressable" onclick="${slide.action}">${slide.cta}</button>
                  </div>
                </div>`).join('')}
            </div>
          </div>
          <div class="hero-dots">
            ${AUTH_HERO_SLIDES.map((_, i) => `
              <button class="hero-dot dash-hero-dot${i === 0 ? ' hero-dot--active' : ''}"
                      data-index="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}
          </div>
        </div>
      </section>

      <!-- Section 2: Sci-Fi Inspiration Carousel -->
      <section class="dash-section">
        <div class="dash-section__header">
          <span class="dash-section__title">Sci-Fi Inspiration</span>
          <button class="dash-section__link pressable" onclick="handleBottomNav('inspo')">View More</button>
        </div>
        <div class="dash-scifi-scroll">
          ${SCIFI_CARDS.map((card, i) => `
            <div class="dash-scifi-card pressable" onclick="openScifiModal(${i})"
                 style="background-image:url('${safeImgUrl(card.img)}')">
              <button class="dash-scifi-card__bookmark pressable" onclick="event.stopPropagation()" aria-label="Save ${card.title}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>`).join('')}
        </div>
      </section>

      <!-- Section 3: Swipable — Completed & Saved Exercises -->
      <section class="dash-section">
        <div class="dash-slider" id="dash-slider">
          <div class="dash-slider__track" id="dash-slider-track">
            <!-- Panel A: Completed / Start -->
            <div class="dash-slider__panel">
              <div class="dash-panel-header">
                ${completedThree.length > 0
                  ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     Completed Exercises`
                  : `Start an Exercise`}
              </div>
              ${completedPanel}
            </div>
            <!-- Panel B: Saved -->
            <div class="dash-slider__panel">
              <div class="dash-panel-header">
                Saved Exercises
              </div>
              ${savedPanel}
            </div>
          </div>
          <!-- Dot indicators -->
          <div class="dash-slider__dots">
            <button class="dash-slider__dot dash-slider__dot--active" onclick="dashSliderGoTo(0)" aria-label="Completed"></button>
            <button class="dash-slider__dot" onclick="dashSliderGoTo(1)" aria-label="Saved"></button>
          </div>
        </div>
      </section>

      <!-- Section 4: Products We Love -->
      <section class="dash-section">
        <div class="dash-section__header">
          <span class="dash-section__title">Products We Love</span>
        </div>
        <div class="dash-products-scroll">
          ${PRODUCTS_WE_LOVE.map(p => `
            <div class="dash-product-card">
              <div class="dash-product-card__img" style="background:${p.color}"></div>
              <div class="dash-product-card__title">${p.title}</div>
              <div class="dash-product-card__body">${p.body}</div>
            </div>`).join('')}
        </div>
      </section>

      <!-- Section 5: Want more? -->
      <section class="dash-section dash-cta-section">
        <div class="dash-cta-block">
          <div class="dash-cta-block__title">Want more from this product?</div>
          <div class="dash-cta-block__subtitle">Provide feedback or ideas on how we can improve</div>
          <div class="dash-cta-block__actions">
            <button class="dash-cta-block__primary pressable">Donate</button>
            <button class="dash-cta-block__secondary pressable">Feedback</button>
          </div>
        </div>
      </section>

    </div>
  `;

  initDashSlider();
  initDashHeroCarousel();
}

function dashSliderGoTo(index) {
  const track = document.getElementById('dash-slider-track');
  const dots = document.querySelectorAll('.dash-slider__dot');
  if (!track) return;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('dash-slider__dot--active', i === index));
}

function initDashSlider() {
  const track = document.getElementById('dash-slider-track');
  if (!track) return;
  let startX = 0;
  let currentIndex = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      currentIndex = diff > 0 ? Math.min(1, currentIndex + 1) : Math.max(0, currentIndex - 1);
      dashSliderGoTo(currentIndex);
    }
  }, { passive: true });
}

function initDashHeroCarousel() {
  const track = document.getElementById('dash-hero-track');
  const wrap  = document.getElementById('dash-hero-track-wrap');
  const dots  = document.querySelectorAll('.dash-hero-dot');
  if (!track || !wrap) return;

  const total = AUTH_HERO_SLIDES.length;
  let current = 0;
  let autoTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;

  function goTo(index, animate = true) {
    current = ((index % total) + total) % total;
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    track.style.transform  = `translateX(${-current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('hero-dot--active', i === current));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setTimeout(() => { goTo(current + 1); startAuto(); }, 5000);
  }
  function stopAuto() { if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; } }

  // Dot click
  dots.forEach(dot => {
    dot.addEventListener('click', () => { stopAuto(); goTo(parseInt(dot.dataset.index)); startAuto(); });
  });

  // Touch swipe
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) isDragging = true;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isDragging) { startAuto(); return; }
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  // Pause on hover (desktop)
  wrap.addEventListener('mouseenter', stopAuto);
  wrap.addEventListener('mouseleave', startAuto);

  goTo(0, false);
  startAuto();
}

// -- Home Page (unauthenticated) ------------------------------
function renderHome() {
  // Authenticated users get the personalised dashboard
  if (currentUser) { renderAuthHome(); return; }

  const el = document.getElementById('page-home');

  el.innerHTML = `
    <div id="home-panels" class="home-panels">
      <div id="home-panels-track" class="home-panels__track">

        <!-- Panel 0: Full-screen hero banner (single slide) -->
        <div class="home-panel home-panel--hero">
          <div class="home-hero-carousel">
            ${(() => {
              const slide = HERO_SLIDES[0];
              const heroMedia = resolveMedia(slide.imageUrl || null);
              const hasImage = heroMedia && heroMedia.type === 'image';
              const heroStyle = hasImage
                ? `background-image: url('${heroMedia.src}'); background-size: cover; background-position: center; background-color: #111;`
                : `background: ${slide.bg};`;
              return `
              <div class="hero-slide" style="${heroStyle}">
                <div class="hero-slide__content">
                  <div class="hero-slide__title">${slide.title}</div>
                  <div class="hero-slide__subtitle">${slide.subtitle}</div>
                  <div class="hero-slide__email-row">
                    <input type="email" class="hero-slide__email-input" placeholder="enter email address" />
                    <button class="hero-slide__email-cta pressable" onclick="handleHeroEmailSignup()">Create Account</button>
                  </div>
                </div>
              </div>`;
            })()}
            <nav class="hero-top-nav">
              <div class="hero-top-nav__center">
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('inspo')">Inspo</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('home')">Home</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('search')">Browse</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('catalogue')">Catalogue</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('exercises')">Exercises</button>
              </div>
              <button class="hero-top-nav__login pressable" onclick="navigateTo('page-auth', renderAuth)">Login</button>
            </nav>
          </div>
          <div class="panel-scroll-hint" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Scroll</span>
          </div>
        </div>

        <!-- Panel 1: Niche Catalogue -->
        <div class="home-panel home-panel--catalogue">
          <div class="selfdriven-topbar">
            <p class="selfdriven-topbar__text">Everything you need to keep inspired. <strong>All for free.</strong></p>
            <button class="selfdriven-topbar__cta pressable" onclick="navigateTo('page-auth', renderAuth)">Get Started</button>
          </div>
          <div class="catalogue-block">
            <div class="catalogue-block__content">
              <h2 class="catalogue-block__title">NICHE, HANDPICKED INSPIRATION CATALOGUE.</h2>
              <p class="catalogue-block__body">In a world filled with noise, genAI, distractions, you can be sure this creative catalogue of inspiration has been saved and curated since 2008. Websites that hosted some of this art no longer exist.</p>
              <button class="catalogue-block__cta pressable" onclick="handleBottomNav('search')">Learn More</button>
            </div>
          </div>
          <div class="panel-scroll-hint" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Scroll</span>
          </div>
        </div>

        <!-- Panel 2: Self-Driven manifesto -->
        <div class="home-panel home-panel--selfdriven">
          <div class="selfdriven-block">
            <div class="selfdriven-block__content">
              <h2 class="selfdriven-block__title">SELF-<span class="selfdriven-rotator"><span class="selfdriven-rotator__word selfdriven-rotator__word--active">DRIVEN</span></span></h2>
              <p class="selfdriven-block__body">Art communities, online art groups, and mentorships don't always provide the structure for the independent artist to stay inspired or accountable for their creative journey. This is for you.</p>
              <p class="selfdriven-cards__subtitle">What makes it different?</p>
              <div class="selfdriven-cards">
                <div class="selfdriven-cards__item">
                  <h3 class="selfdriven-cards__title">Simple Tactics for Complex Subjects</h3>
                  <p class="selfdriven-cards__body">Complex subjects broken into focused, bite-sized exercises.</p>
                  <ul class="selfdriven-cards__bullets">
                    <li>Step-by-step breakdowns</li>
                    <li>Timed warm-up drills</li>
                    <li>Layered difficulty levels</li>
                  </ul>
                </div>
                <div class="selfdriven-cards__item">
                  <h3 class="selfdriven-cards__title">Plans Built for You</h3>
                  <p class="selfdriven-cards__body">Personalized assignment plans tailored to your goals, skill level, and preferred subject.</p>
                  <ul class="selfdriven-cards__bullets">
                    <li>Goal-based curriculums</li>
                    <li>Adaptive skill paths</li>
                    <li>Weekly assignment schedules</li>
                  </ul>
                </div>
                <div class="selfdriven-cards__item">
                  <h3 class="selfdriven-cards__title">Build Creative Habits</h3>
                  <p class="selfdriven-cards__body">Daily routines designed to keep you consistent, motivated, and improving.</p>
                  <ul class="selfdriven-cards__bullets">
                    <li>Streak tracking & reminders</li>
                    <li>Micro-sessions (15 min or less)</li>
                    <li>Progress milestones</li>
                  </ul>
                </div>
              </div>
              <button class="selfdriven-block__cta pressable" onclick="handleBottomNav('exercises')">Learn More</button>
            </div>
          </div>
          <div class="panel-scroll-hint" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Scroll</span>
          </div>
        </div>

        <!-- Panel 3: Discover Your Passion -->
        <div class="home-panel home-panel--passion">
          <div class="passion-block">
            <div class="passion-block__content">
              <p class="passion-block__eyebrow">Your Journey</p>
              <div class="passion-block__title">Discover Your Passion</div>
              <div class="passion-block__subtitle">Find the subjects that move you — explore, experiment, and create without limits</div>
              <div class="passion-block__ctas">
                <button class="passion-block__cta passion-block__cta--primary pressable" onclick="${currentUser ? "handleBottomNav('exercises')" : "navigateTo('page-auth', renderAuth)"}">Get Started</button>
                <button class="passion-block__cta passion-block__cta--secondary pressable" onclick="handleBottomNav('inspo')">Explore Inspiration</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  `;

  initHomePanels();
  initSelfDrivenRotator();
}

// -- Self-Driven word rotator ------------------------------------
let _selfDrivenTimer = null;
function initSelfDrivenRotator() {
  if (_selfDrivenTimer) { clearInterval(_selfDrivenTimer); _selfDrivenTimer = null; }
  const container = document.querySelector('.selfdriven-rotator');
  if (!container) return;

  const words = ['DRIVEN', 'INITIATED', 'GUIDED', 'TAUGHT', 'STRUCTURED'];
  let idx = 0;

  _selfDrivenTimer = setInterval(() => {
    const current = container.querySelector('.selfdriven-rotator__word--active');
    if (!current) return;

    // Start exit animation on current word
    current.classList.remove('selfdriven-rotator__word--active');
    current.classList.add('selfdriven-rotator__word--exit');

    // Create next word
    idx = (idx + 1) % words.length;
    const next = document.createElement('span');
    next.className = 'selfdriven-rotator__word selfdriven-rotator__word--enter';
    next.textContent = words[idx];
    container.appendChild(next);

    // Trigger enter animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        next.classList.remove('selfdriven-rotator__word--enter');
        next.classList.add('selfdriven-rotator__word--active');
      });
    });

    // Remove exited word after animation completes
    setTimeout(() => { if (current.parentNode) current.remove(); }, 250);
  }, 2500);
}

// -- Hero Carousel Logic ---------------------------------------
let heroCarouselState = null;

function initHeroCarousel() {
  const track = document.getElementById('hero-track');
  const wrap = document.getElementById('hero-track-wrap');
  const dots = document.querySelectorAll('.hero-dot');
  if (!track || !wrap) return;

  const total = HERO_SLIDES.length;
  let current = 0;
  let autoTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;

  function goTo(index, animate = true) {
    // Stop video on the slide we're leaving by blanking its iframe src
    const leavingIframe = track.children[current]?.querySelector('.hero-slide__video-iframe');
    if (leavingIframe) leavingIframe.src = 'about:blank';

    current = ((index % total) + total) % total;
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    track.style.transform = `translateX(${-current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('hero-dot--active', i === current));

    // Show welcome text only on the first slide
    const welcomeEl = document.querySelector('.home-hero-carousel__welcome');
    if (welcomeEl) welcomeEl.style.display = current === 0 ? '' : 'none';

    // Restore video on the slide we're arriving at — reloads from start=42
    const arrivingIframe = track.children[current]?.querySelector('.hero-slide__video-iframe');
    if (arrivingIframe && HERO_SLIDES[current].videoUrl) {
      setTimeout(() => { arrivingIframe.src = HERO_SLIDES[current].videoUrl; }, animate ? 400 : 0);
    }
  }

  function startAuto() {
    stopAuto();
    // First slide lingers for 7s; all others advance after 5s
    const delay = current === 0 ? 7000 : 5000;
    autoTimer = setTimeout(() => {
      goTo(current + 1);
      startAuto();
    }, delay);
  }

  function stopAuto() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  // Dot click navigation (desktop / tablet)
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(parseInt(dot.dataset.index));
      startAuto();
    });
  });

  // Touch / swipe (mobile)
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
    stopAuto();
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) { startAuto(); return; }
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      goTo(dx < 0 ? current + 1 : current - 1);
    }
    startAuto();
  }, { passive: true });

  // Pause on hover (desktop)
  wrap.addEventListener('mouseenter', stopAuto);
  wrap.addEventListener('mouseleave', startAuto);

  // Init
  goTo(0, false);
  startAuto();

  // Store ref so navigating away can clean up
  heroCarouselState = { stop: stopAuto };
}

// -- Home Panel Scroll System ----------------------------------
function initHomePanels() {
  const container = document.getElementById('home-panels');
  const track = document.getElementById('home-panels-track');
  const pageEl = document.getElementById('page-home');
  if (!container || !track || !pageEl) return;

  const TOTAL = track.querySelectorAll('.home-panel').length;
  let current = 0;
  let isTransitioning = false;
  let released = false;

  // Lock page scroll while navigating panels
  pageEl.style.overflowY = 'hidden';

  function goToPanel(idx, animate = true) {
    if (isTransitioning) return;
    const next = Math.max(0, Math.min(TOTAL - 1, idx));
    if (next === current && animate) return;
    isTransitioning = true;
    current = next;
    track.style.transition = animate ? 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'none';
    track.style.transform = `translateY(${-current * 100}vh)`;
    // Update scroll hint visibility — hide on last panel
    container.querySelectorAll('.panel-scroll-hint').forEach((el, i) => {
      el.style.opacity = (i === current && current < TOTAL - 1) ? '1' : '0';
    });
    setTimeout(() => { isTransitioning = false; }, 850);
  }

  function attachListeners() {
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function detachListeners() {
    container.removeEventListener('wheel', onWheel);
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchend', onTouchEnd);
  }

  // Re-engage panel mode when user scrolls back to the very top of the page
  function onPageScrollUp() {
    if (pageEl.scrollTop > 0) return;
    pageEl.removeEventListener('scroll', onPageScrollUp);
    released = false;
    current = TOTAL - 1; // Re-enter at last panel
    pageEl.style.overflowY = 'hidden';
    track.style.transition = 'none';
    track.style.transform = `translateY(${-current * 100}vh)`;
    container.querySelectorAll('.panel-scroll-hint').forEach((el, i) => {
      el.style.opacity = (i === current && current < TOTAL - 1) ? '1' : '0';
    });
    attachListeners();
  }

  function release() {
    if (released) return;
    released = true;
    pageEl.style.overflowY = '';
    detachListeners();
    // Smoothly scroll page to reveal below-fold content
    const belowFold = document.querySelector('.home-below-fold');
    if (belowFold) {
      setTimeout(() => belowFold.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    // Wait for scroll animation to settle, then watch for scroll-back-to-top
    setTimeout(() => {
      pageEl.addEventListener('scroll', onPageScrollUp, { passive: true });
    }, 900);
  }

  function onWheel(e) {
    if (released) return;
    e.preventDefault();
    if (isTransitioning) return;
    if (e.deltaY > 15) {
      if (current < TOTAL - 1) goToPanel(current + 1);
    } else if (e.deltaY < -15 && current > 0) {
      goToPanel(current - 1);
    }
  }

  let touchStartY = 0;
  function onTouchStart(e) { touchStartY = e.touches[0].clientY; }
  function onTouchEnd(e) {
    if (released || isTransitioning) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 50) return;
    if (dy > 0) {
      if (current < TOTAL - 1) goToPanel(current + 1);
    } else if (current > 0) {
      goToPanel(current - 1);
    }
  }

  attachListeners();

  // Init scroll hint state
  goToPanel(0, false);
}

// -- Exercise List Page ----------------------------------------
function renderExerciseList() {
  const el = document.getElementById('page-exercises');
  const expandedState = {};
  APP_DATA.categories.forEach((c, i) => expandedState[c.id] = i === 0);

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <span class="nav-bar__title" style="text-align:center;width:100%">Exercises</span>
      </div>
    </div>
    <div class="grid-container">
      <div class="exercise-list__inner">
        <div class="exercise-tools-row">
          ${renderGenerateWidget()}
          ${renderCoachWidget()}
        </div>
        <div class="exercise-list__heading">
          <h1>3-MINUTE EXERCISES</h1>
          <div class="subtitle-italic">Drawing exercises to stay inspired.</div>
          <div class="subtitle-regular">Quick daily practices to sharpen your skills.</div>
        </div>
        <div id="categories-container"></div>
      </div>
    </div>
  `;

  renderCategories(expandedState);
}

function renderGenerateWidget() {
  return `
    <div class="gen-widget">
      <div class="gen-widget__header">
        <div class="gen-widget__title">Generate Exercises</div>
        <div class="gen-widget__subtitle">AI-powered personalised lesson plan</div>
      </div>
      <div class="gen-widget__session">
        <span class="gen-widget__label">Session</span>
        <div class="gen-widget__pills">
          <button class="gen-pill active pressable" data-minutes="15" onclick="selectGenPill(this)">15 min</button>
          <button class="gen-pill pressable" data-minutes="30" onclick="selectGenPill(this)">30 min</button>
          <button class="gen-pill pressable" data-minutes="45" onclick="selectGenPill(this)">45 min</button>
        </div>
      </div>
      <button class="gen-widget__btn pressable" id="gen-btn" onclick="generateLessonPlan()">Generate Plan</button>
    </div>
  `;
}

function selectGenPill(el) {
  document.querySelectorAll('.gen-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function generateLessonPlan() {
  const btn = document.getElementById('gen-btn');
  btn.textContent = 'Generating…';
  btn.disabled = true;

  setTimeout(() => {
    const activePill = document.querySelector('.gen-pill.active');
    const minutes = parseInt(activePill?.dataset.minutes || '30');
    const targetCount = Math.max(1, Math.floor(minutes / 3));

    // Round-robin across categories for variety
    const plan = [];
    let remaining = targetCount;
    while (remaining > 0) {
      let added = 0;
      for (const cat of APP_DATA.categories) {
        if (remaining <= 0) break;
        const alreadyFromCat = plan.filter(p => p.catId === cat.id).length;
        if (alreadyFromCat < cat.exercises.length) {
          plan.push({ ...cat.exercises[alreadyFromCat], catId: cat.id, catTitle: cat.title });
          remaining--;
          added++;
        }
      }
      if (added === 0) break; // all exercises exhausted
    }

    window._generatedPlan = plan;
    const totalMin = plan.reduce((t, e) => t + (parseInt(e.duration) || 3), 0);

    openGenPlanModal(plan, minutes, totalMin);

    btn.textContent = 'Regenerate';
    btn.disabled = false;
  }, 900);
}

function downloadLessonPlan() {
  const plan = window._generatedPlan;
  if (!plan) return;
  let content = 'DRAWING APP — LESSON PLAN\n';
  content += '==========================\n\n';
  plan.forEach((ex, i) => {
    content += `${i + 1}. ${ex.title}\n`;
    content += `   Category : ${ex.catTitle}\n`;
    content += `   Duration : ${ex.duration}\n`;
    if (ex.description) content += `   Notes    : ${ex.description}\n`;
    content += '\n';
  });
  const totalMin = plan.reduce((t, e) => t + (parseInt(e.duration) || 3), 0);
  content += `Total time: ${totalMin} min\n`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'drawing-lesson-plan.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Generated Plan Modal ────────────────────────────────────

const SAVED_PLANS_KEY = 'da_saved_plans';
function getSavedPlans() {
  try { return JSON.parse(localStorage.getItem(SAVED_PLANS_KEY) || '[]'); } catch { return []; }
}

function openGenPlanModal(plan, minutes, totalMin) {
  // Remove existing modal if any
  const existing = document.getElementById('gen-plan-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'gen-plan-modal';
  modal.className = 'gen-plan-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'gen-plan-modal-title');
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeGenPlanModal();
  });

  modal.innerHTML = `
    <div class="gen-plan-modal__container">
      <div class="gen-plan-modal__header">
        <span class="gen-plan-modal__title" id="gen-plan-modal-title">Your Plan</span>
        <button class="gen-plan-modal__close pressable" onclick="closeGenPlanModal()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
          </svg>
        </button>
      </div>
      <div class="gen-plan-modal__body">
        <div class="gen-plan-modal__summary">YOUR ${minutes}-MIN PLAN &middot; ${plan.length} EXERCISES &middot; ${totalMin} MIN</div>
        <div class="gen-plan-modal__list">
          ${plan.map((ex, i) => `
            <div class="gen-results__item">
              <span class="gen-results__num">${i + 1}</span>
              <div class="gen-results__info">
                <div class="gen-results__title">${ex.title}</div>
                <div class="gen-results__meta">${ex.catTitle}&nbsp;&middot;&nbsp;${ex.duration}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="gen-plan-modal__actions">
        <button class="gen-action-btn gen-action-btn--outline pressable" onclick="downloadLessonPlan()">Download</button>
        <button class="gen-action-btn gen-action-btn--fill pressable" id="gen-save-btn" onclick="saveGenPlan()">Save Plan</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Keyboard support: Escape to close + focus trap
  window._genPlanModalKeyHandler = function(e) {
    if (e.key === 'Escape') { closeGenPlanModal(); return; }
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', window._genPlanModalKeyHandler);
  // Move focus into modal
  const closeBtn = modal.querySelector('.gen-plan-modal__close');
  if (closeBtn) closeBtn.focus();
}

function closeGenPlanModal() {
  const modal = document.getElementById('gen-plan-modal');
  if (modal) modal.remove();
  if (window._genPlanModalKeyHandler) {
    document.removeEventListener('keydown', window._genPlanModalKeyHandler);
    window._genPlanModalKeyHandler = null;
  }
}

function saveGenPlan() {
  const plan = window._generatedPlan;
  if (!plan) return;
  const saved = getSavedPlans();
  const activePill = document.querySelector('.gen-pill.active');
  const minutes = parseInt(activePill?.dataset.minutes || '30');
  const totalTime = plan.reduce((t, e) => t + (parseInt(e.duration) || 3), 0);
  saved.unshift({
    id: 'plan-' + Date.now(),
    minutes,
    exerciseCount: plan.length,
    totalTime,
    exercises: plan.map(e => ({ id: e.id, title: e.title, category: e.catTitle || e.category, catId: e.catId, duration: e.duration })),
    savedAt: Date.now()
  });
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(saved));
  const btn = document.getElementById('gen-save-btn');
  if (btn) { btn.textContent = '✓ Saved'; btn.disabled = true; }
  if (document.getElementById('page-catalogue')?.classList.contains('active')) {
    renderCatalogue();
  }
}

// ─── AI DRAWING COACH ────────────────────────────────────────

function renderCoachWidget() {
  return `
    <div class="gen-widget coach-widget">
      <div class="gen-widget__header">
        <div class="gen-widget__title">AI Drawing Coach</div>
        <div class="gen-widget__subtitle">Upload your drawing for professional-level feedback</div>
      </div>
      <div id="coach-body">
        <div class="coach-upload-zone" id="coach-drop-zone"
             onclick="document.getElementById('coach-file-input').click()">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
          <div class="coach-upload-zone__text"><strong>Tap to upload</strong> or drag & drop</div>
          <div class="coach-upload-zone__hint">PNG, JPG up to 5 MB</div>
        </div>
        <input type="file" id="coach-file-input" accept="image/*" capture="environment"
               style="display:none" onchange="handleCoachFileSelect(this)">
      </div>
    </div>
  `;
}

function handleCoachFileSelect(input) {
  const file = input.files && input.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  coachProcessImage(file);
}

// Allow drag-and-drop on the coach zone
document.addEventListener('dragover', function(e) {
  const zone = document.getElementById('coach-drop-zone');
  if (!zone || !zone.contains(e.target)) return;
  e.preventDefault();
  zone.classList.add('coach-upload-zone--active');
});
document.addEventListener('dragleave', function(e) {
  const zone = document.getElementById('coach-drop-zone');
  if (!zone) return;
  zone.classList.remove('coach-upload-zone--active');
});
document.addEventListener('drop', function(e) {
  const zone = document.getElementById('coach-drop-zone');
  if (!zone || !zone.contains(e.target)) return;
  e.preventDefault();
  zone.classList.remove('coach-upload-zone--active');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) coachProcessImage(file);
});

function coachProcessImage(file) {
  const reader = new FileReader();
  reader.onload = function() {
    const img = new Image();
    img.onload = function() {
      // Resize to max 1024px
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      const max = 1024;
      if (w > max || h > max) {
        const scale = w > h ? max / w : max / h;
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const base64 = dataUrl.split(',')[1];
      window._coachImageBase64 = base64;
      window._coachImagePreview = dataUrl;
      coachShowPreview(dataUrl);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function coachShowPreview(dataUrl) {
  const body = document.getElementById('coach-body');
  body.innerHTML = `
    <div class="coach-preview">
      <img src="${dataUrl}" class="coach-preview__img" alt="Your drawing">
      <div class="coach-preview__actions">
        <button class="gen-widget__btn pressable" style="max-width:100%" onclick="coachAnalyze()">
          ✦&ensp;Get Feedback
        </button>
        <button class="gen-action-btn gen-action-btn--outline pressable" style="width:100%" onclick="coachReset()">
          Choose Different Image
        </button>
      </div>
    </div>
  `;
}

function coachReset() {
  const body = document.getElementById('coach-body');
  if (!body) return;
  body.innerHTML = `
    <div class="coach-upload-zone" id="coach-drop-zone"
         onclick="document.getElementById('coach-file-input').click()">
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
      </svg>
      <div class="coach-upload-zone__text"><strong>Tap to upload</strong> or drag & drop</div>
      <div class="coach-upload-zone__hint">PNG, JPG up to 5 MB</div>
    </div>
    <input type="file" id="coach-file-input" accept="image/*" capture="environment"
           style="display:none" onchange="handleCoachFileSelect(this)">
  `;
  window._coachImageBase64 = null;
  window._coachImagePreview = null;
}

function coachAnalyze() {
  const base64 = window._coachImageBase64;
  if (!base64) return;

  const body = document.getElementById('coach-body');
  body.innerHTML = `
    <div class="coach-loading">
      <img src="${window._coachImagePreview}" class="coach-preview__img coach-preview__img--dim" alt="Your drawing">
      <div class="coach-loading__spinner"></div>
      <div class="coach-loading__text">Analyzing your drawing…</div>
    </div>
  `;

  // Call the Next.js API route (or direct Claude API if configured)
  const apiUrl = window._coachApiUrl || '/api/analyze';

  // For the standalone web widget at port 3000
  const fullUrl = apiUrl.startsWith('http') ? apiUrl : 'http://localhost:3000' + apiUrl;

  fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  })
  .then(r => r.json())
  .then(data => {
    if (data.success && data.feedback) {
      coachShowFeedback(data.feedback);
    } else {
      coachShowError(data.error || 'Unable to analyze this drawing.');
    }
  })
  .catch(err => {
    coachShowError(err.message || 'Network error. Make sure the AI Coach server is running.');
  });
}

function coachShowError(msg) {
  const body = document.getElementById('coach-body');
  body.innerHTML = `
    <div class="coach-error">
      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      <div class="coach-error__title">Something went wrong</div>
      <div class="coach-error__msg">${msg}</div>
      <button class="gen-widget__btn pressable" style="max-width:180px" onclick="coachAnalyze()">Try Again</button>
      <button class="gen-action-btn gen-action-btn--outline pressable" style="margin-top:8px" onclick="coachReset()">Upload New Image</button>
    </div>
  `;
}

function coachShowFeedback(fb) {
  const body = document.getElementById('coach-body');
  const categoriesHTML = fb.categories.map((cat, i) => `
    <div class="coach-cat">
      <button class="coach-cat__header pressable" onclick="toggleCoachCat(${i})">
        <span class="coach-cat__name">${cat.name}</span>
        <div class="coach-cat__right">
          <span class="coach-cat__score">${cat.score}/10</span>
          <span class="coach-cat__chevron" id="coach-chev-${i}">${ICONS.chevronRight}</span>
        </div>
      </button>
      <div class="coach-cat__body" id="coach-cat-body-${i}" style="max-height:0;overflow:hidden;">
        <div class="coach-cat__text">${cat.commentary}</div>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="coach-feedback">
      <img src="${window._coachImagePreview}" class="coach-preview__img" alt="Your drawing">

      <div class="coach-score">
        <span class="coach-score__num">${fb.overallScore}</span>
        <span class="coach-score__label">/ 10</span>
      </div>

      <div class="coach-summary">${fb.summary}</div>

      <div class="coach-section">
        <div class="coach-section__label">STRENGTHS</div>
        ${fb.strengths.map(s => `
          <div class="coach-bullet"><span class="coach-bullet__dot"></span>${s}</div>
        `).join('')}
      </div>

      <div class="coach-section">
        <div class="coach-section__label">AREAS FOR IMPROVEMENT</div>
        ${fb.areasForImprovement.map(a => `
          <div class="coach-bullet"><span class="coach-bullet__dot"></span>${a}</div>
        `).join('')}
      </div>

      <div class="coach-section">
        <div class="coach-section__label">DETAILED BREAKDOWN</div>
        ${categoriesHTML}
      </div>

      <div class="coach-section">
        <div class="coach-section__label">SUGGESTED EXERCISES</div>
        ${fb.suggestedExercises.map(e => `
          <div class="coach-bullet"><span class="coach-bullet__dot"></span>${e}</div>
        `).join('')}
      </div>

      <button class="gen-widget__btn pressable" style="max-width:100%;margin-top:8px" onclick="coachReset()">
        Analyze Another Drawing
      </button>
    </div>
  `;
}

function toggleCoachCat(i) {
  const bodyEl = document.getElementById(`coach-cat-body-${i}`);
  const chevron = document.getElementById(`coach-chev-${i}`);
  if (!bodyEl) return;
  const isOpen = bodyEl.style.maxHeight !== '0px' && bodyEl.style.maxHeight !== '0';
  if (isOpen) {
    bodyEl.style.maxHeight = '0';
    bodyEl.style.overflow = 'hidden';
    chevron.classList.remove('expanded');
  } else {
    bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
    bodyEl.style.overflow = '';
    chevron.classList.add('expanded');
  }
}

// ─── END AI DRAWING COACH ────────────────────────────────────

function renderCategories(expandedState) {
  const container = document.getElementById('categories-container');
  container.innerHTML = APP_DATA.categories.map(cat => `
    <div class="cat-section" data-cat-id="${cat.id}">
      <button class="cat-section__header pressable" onclick="toggleCategory('${cat.id}')">
        <div class="cat-section__info">
          <div class="cat-section__name">${cat.title}</div>
          <div class="cat-section__time">
            ${ICONS.clockOutline}
            <span>TOTAL TIME: ${cat.totalTime}</span>
          </div>
        </div>
        <span class="cat-section__chevron ${expandedState[cat.id] ? 'expanded' : ''}" id="chevron-${cat.id}">${ICONS.chevronRight}</span>
      </button>
      <div class="cat-section__exercises" id="exercises-${cat.id}" style="${expandedState[cat.id] ? '' : 'max-height:0;overflow:hidden;'}">
        <div class="cat-section__exercises-grid">
          ${cat.exercises.map(ex => exerciseRowHTML(ex, cat)).join('')}
        </div>
      </div>
      <div class="cat-section__divider"></div>
    </div>
  `).join('');

  container._expandedState = expandedState;
}

function toggleCategory(catId) {
  const container = document.getElementById('categories-container');
  const state = container._expandedState;
  state[catId] = !state[catId];

  const exercisesEl = document.getElementById(`exercises-${catId}`);
  const chevron = document.getElementById(`chevron-${catId}`);

  if (state[catId]) {
    exercisesEl.style.maxHeight = exercisesEl.scrollHeight + 'px';
    exercisesEl.style.overflow = '';
    chevron.classList.add('expanded');
  } else {
    exercisesEl.style.maxHeight = '0';
    exercisesEl.style.overflow = 'hidden';
    chevron.classList.remove('expanded');
  }
}

function exerciseRowHTML(ex, cat) {
  const isBookmarked = bookmarks.has(ex.id);
  const thumbMedia = resolveMedia(ex.imageUrl || null);
  const thumbHasImg = thumbMedia && thumbMedia.type === 'image';
  const thumbStyle = thumbHasImg
    ? `background-image:url('${thumbMedia.src}');background-size:cover;background-position:center;`
    : '';
  return `
    <div class="exercise-row pressable" onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })">
      <div class="exercise-row__thumb ${thumbHasImg ? 'exercise-row__thumb--has-image' : ''}" style="${thumbStyle}">${thumbHasImg ? '' : ex.number}</div>
      <div class="exercise-row__content">
        <div class="exercise-row__top">
          <div>
            <div class="exercise-row__title">${ex.title}</div>
            <div class="exercise-row__desc">${ex.description}</div>
          </div>
          <button class="exercise-row__bookmark pressable" data-id="${ex.id}" onclick="event.stopPropagation(); toggleBookmark('${ex.id}')">
            ${isBookmarked ? ICONS.bookmarkFill : ICONS.bookmark}
          </button>
        </div>
        <div class="exercise-row__meta">
          <span class="exercise-row__duration">${ICONS.clockOutline}${ex.duration}</span>
          <button class="exercise-row__watch-btn pressable">${ICONS.play} Watch Video</button>
        </div>
      </div>
    </div>
  `;
}

function toggleBookmark(exId) {
  // Toggle in-memory Set
  if (bookmarks.has(exId)) {
    bookmarks.delete(exId);
  } else {
    bookmarks.add(exId);
  }
  const isNowBookmarked = bookmarks.has(exId);

  // Sync to localStorage (da_saved_assignments) so bookmarks persist across sessions
  const saved = getSavedAssignments();
  const idx = saved.findIndex(s => s.id === exId);
  if (isNowBookmarked && idx === -1) {
    // Find the exercise in APP_DATA to get full metadata
    let exData = null, catData = null;
    if (APP_DATA && APP_DATA.categories) {
      for (const cat of APP_DATA.categories) {
        const found = cat.exercises.find(e => e.id === exId);
        if (found) { exData = found; catData = cat; break; }
      }
    }
    if (exData) {
      saved.unshift({ id: exId, title: exData.title, category: catData.title, catId: catData.id, duration: exData.duration, type: 'assignment', savedAt: Date.now() });
    }
  } else if (!isNowBookmarked && idx > -1) {
    saved.splice(idx, 1);
  }
  localStorage.setItem(SAVED_ASSIGN_KEY, JSON.stringify(saved));
  invalidateSavedCaches();

  // Targeted DOM update: update all visible bookmark icons for this exercise
  const newIcon = isNowBookmarked ? ICONS.bookmarkFill : ICONS.bookmark;
  const videoBookmarkBtn = document.getElementById('video-bookmark-btn');
  if (videoBookmarkBtn) videoBookmarkBtn.innerHTML = newIcon;
  document.querySelectorAll(`.exercise-row__bookmark[data-id="${exId}"]`).forEach(btn => {
    btn.innerHTML = newIcon;
  });
  document.querySelectorAll(`#fy-bm-${exId}`).forEach(btn => {
    btn.classList.toggle('fy-action--saved', isNowBookmarked);
  });

  // Refresh bookmarks page if active
  if (document.getElementById('page-catalogue')?.classList.contains('active')) {
    renderCatalogue();
  }
}

// -- Auth Gate Pages -------------------------------------------
function renderCatalogueGate() {
  const el = document.getElementById('page-catalogue');

  // Column-specific images by INSPO_DATA category tag
  // Col 1: 2D line art / detailed / sketch
  const col1 = [
    'assets/img/Characters/1073265_10201592356909618_816284181_o.jpg',
    'assets/img/Characters/278_max.jpg',
    'assets/img/Characters/314_max.jpg',
    'assets/img/Characters/347_large.jpg',
    'assets/img/Characters/530_max.jpg',
    'assets/img/Characters/655_max.jpg',
    'assets/img/Characters/68_tid_04=.jpg',
    'assets/img/Characters/68_tid_07=.jpg',
  ];
  // Col 2: Sci-Fi / architecture / environment / matte painting
  const col2 = [
    'assets/img/Characters/000_max.jpg',
    'assets/img/Characters/061_max.jpg',
    'assets/img/Characters/117_max.jpg',
    'assets/img/Characters/164_large.jpg',
    'assets/img/Characters/338_max.jpg',
    'assets/img/Characters/438_max.jpg',
    'assets/img/Characters/540_max.jpg',
    'assets/img/Characters/560_max.jpg',
  ];
  // Col 3: 3D sculpt / creature / organic modeling
  const col3 = [
    'assets/img/Characters/122_max.jpg',
    'assets/img/Characters/fzd_zbrush_week02_11.jpg',
    'assets/img/Characters/fzd_zbrush_week02_12.jpg',
    'assets/img/Fantasy/831_max.jpg',
    'assets/img/Robotic/048_max.jpg',
    'assets/img/Robotic/269_max.jpg',
    'assets/img/Robotic/315_max.jpg',
    'assets/img/Robotic/723_large.jpg',
  ];

  const makeTrack = (images) =>
    [...images, ...images].map(src =>
      `<div class="saved-gate__card"><img src="${src}" alt="" loading="lazy"/></div>`
    ).join('');

  el.innerHTML = `
    <div class="saved-gate">
      <nav class="hero-top-nav">
        <div class="hero-top-nav__center">
          <button class="hero-top-nav__link pressable" onclick="handleBottomNav('inspo')">Inspo</button>
          <button class="hero-top-nav__link pressable" onclick="handleBottomNav('home')">Home</button>
          <button class="hero-top-nav__link pressable" onclick="handleBottomNav('search')">Browse</button>
          <button class="hero-top-nav__link pressable" onclick="handleBottomNav('catalogue')">Catalogue</button>
          <button class="hero-top-nav__link pressable" onclick="handleBottomNav('exercises')">Exercises</button>
        </div>
        <button class="hero-top-nav__login pressable" onclick="navigateTo('page-auth', renderAuth)">Login</button>
      </nav>
      <div class="saved-gate__bg">
        <div class="saved-gate__col">
          <div class="saved-gate__track">${makeTrack(col1)}</div>
        </div>
        <div class="saved-gate__col">
          <div class="saved-gate__track saved-gate__track--up">${makeTrack(col2)}</div>
        </div>
        <div class="saved-gate__col saved-gate__col--hide-mobile">
          <div class="saved-gate__track saved-gate__track--fast">${makeTrack(col3)}</div>
        </div>
      </div>
      <div class="saved-gate__overlay"></div>
      <div class="saved-gate__content">
        <h1 class="saved-gate__headline">Creative blocks don't exist here.</h1>
        <p class="saved-gate__sub">Realize your vision. Join for free.</p>
        <p class="saved-gate__body">An unlimited catalogue of inspiration and content at your fingertips. Pursue the dream, build the vision.</p>
        <div class="hero-slide__email-row saved-gate__email-row">
          <input class="hero-slide__email-input" type="email" id="catalogue-gate-email"
            placeholder="Email address" autocomplete="email" aria-label="Email address"
            onkeydown="if(event.key==='Enter') handleCatalogueGateSignup()"/>
          <button class="hero-slide__email-cta pressable" onclick="handleCatalogueGateSignup()">Join Free Today</button>
        </div>
      </div>
    </div>

    <!-- Panel 1: Catalogue — duplicated from home page as starting point -->
    <div class="home-panel home-panel--catalogue">
      <div class="catalogue-block">
        <div class="catalogue-block__content">
          <h2 class="catalogue-block__title">1000+ IMAGES FROM THE CREATIVE INDUSTRY.</h2>
          <p class="catalogue-block__body">In a world filled with noise, genAI, distractions, you can be sure this creative catalogue of inspiration has been saved and curated since 2008. Websites that hosted some of this art no longer exist.</p>
        </div>
      </div>
    </div>`;
  updateBottomNavActive('page-catalogue');
  updateBottomNavVisibility('page-catalogue');
}

function handleCatalogueGateSignup() {
  const email = document.getElementById('catalogue-gate-email')?.value.trim();
  navigateTo('page-auth', renderAuth);
  if (email) {
    setTimeout(() => {
      const authEmail = document.getElementById('auth-email');
      if (authEmail) authEmail.value = email;
    }, 100);
  }
}

function renderAssignmentsGate() {
  const el = document.getElementById('page-exercises');
  el.innerHTML = `
    <div id="exercises-panels" class="home-panels">
      <div id="exercises-panels-track" class="home-panels__track">

        <!-- Panel 0: Full-screen hero banner -->
        <div class="home-panel home-panel--hero">
          <div class="home-hero-carousel">
            <div class="hero-slide" style="background: #111;">
              <div class="hero-slide__content">
                <div class="hero-slide__title">Structure your practice.</div>
                <div class="hero-slide__subtitle">Guided exercises built for the self-driven artist.</div>
                <div class="hero-slide__email-row">
                  <input type="email" class="hero-slide__email-input" id="exercises-gate-email" placeholder="enter email address" autocomplete="email" aria-label="Email address" onkeydown="if(event.key==='Enter') handleExercisesGateSignup()"/>
                  <button class="hero-slide__email-cta pressable" onclick="handleExercisesGateSignup()">Join Free Today</button>
                </div>
              </div>
            </div>
            <nav class="hero-top-nav">
              <div class="hero-top-nav__center">
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('inspo')">Inspo</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('home')">Home</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('search')">Browse</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('catalogue')">Catalogue</button>
                <button class="hero-top-nav__link pressable" onclick="handleBottomNav('exercises')">Exercises</button>
              </div>
              <button class="hero-top-nav__login pressable" onclick="navigateTo('page-auth', renderAuth)">Login</button>
            </nav>
          </div>
          <div class="panel-scroll-hint" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Scroll</span>
          </div>
        </div>

        <!-- Panel 1: Pricing / Sign-up -->
        <div class="home-panel home-panel--exercises-pricing">
          <div class="selfdriven-topbar">
            <p class="selfdriven-topbar__text">Your practice, structured. <strong>All for free, or upgrade.</strong></p>
            <button class="selfdriven-topbar__cta pressable" onclick="navigateTo('page-auth', renderAuth)">Join for $5/mo.</button>
          </div>
          <div class="exercises-pricing-block">
            <div class="exercises-pricing-block__header">
              <h2 class="exercises-pricing-block__title">Curated warm-ups and exercises used by industry experts</h2>
              <p class="exercises-pricing-block__body">Gain insights into the small habits and daily practices that take between 5 and 10 minutes to dramatically improve technical abilities.</p>
            </div>
            <div class="pricing-cards">

              <!-- Card 1: Pro -->
              <div class="pricing-card pricing-card--pro">
                <div class="pricing-card__badge">MOST POPULAR</div>
                <div class="pricing-card__price-row">
                  <span class="pricing-card__price">$5</span><span class="pricing-card__period">/mo</span>
                </div>
                <p class="pricing-card__desc">Everything you need to build a daily creative practice with full guided structure.</p>
                <ul class="pricing-card__bullets">
                  <li>Unlimited access to all exercises &amp; warm-ups</li>
                  <li>Progress tracking &amp; personal streaks</li>
                  <li>Download exercises for offline use</li>
                </ul>
                <button class="pricing-card__cta pressable" onclick="navigateTo('page-auth', renderAuth)">Sign Up Now</button>
              </div>

              <!-- Card 2: Free -->
              <div class="pricing-card pricing-card--free">
                <div class="pricing-card__name">Basic</div>
                <div class="pricing-card__price-row">
                  <span class="pricing-card__price pricing-card__price--free">Free</span>
                </div>
                <p class="pricing-card__desc">Start building your practice with a curated starter set of exercises at no cost.</p>
                <ul class="pricing-card__bullets">
                  <li>Access to starter exercises</li>
                  <li>Browse the full inspiration catalogue</li>
                  <li>Save favorites &amp; build your library</li>
                </ul>
                <button class="pricing-card__cta pricing-card__cta--outline pressable" onclick="navigateTo('page-auth', renderAuth)">Create Account</button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>`;
  updateBottomNavActive('page-exercises');
  updateBottomNavVisibility('page-exercises');
  initExercisesPanels();
}

function handleExercisesGateSignup() {
  const email = document.getElementById('exercises-gate-email')?.value.trim();
  navigateTo('page-auth', renderAuth);
}

function initExercisesPanels() {
  const container = document.getElementById('exercises-panels');
  const track = document.getElementById('exercises-panels-track');
  const pageEl = document.getElementById('page-exercises');
  if (!container || !track || !pageEl) return;

  const TOTAL = track.querySelectorAll('.home-panel').length;
  let current = 0;
  let isTransitioning = false;

  pageEl.style.overflowY = 'hidden';

  function goToPanel(idx, animate = true) {
    if (isTransitioning) return;
    const next = Math.max(0, Math.min(TOTAL - 1, idx));
    if (next === current && animate) return;
    isTransitioning = true;
    current = next;
    track.style.transition = animate ? 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'none';
    track.style.transform = `translateY(${-current * 100}vh)`;
    container.querySelectorAll('.panel-scroll-hint').forEach((el, i) => {
      el.style.opacity = (i === current && current < TOTAL - 1) ? '1' : '0';
    });
    setTimeout(() => { isTransitioning = false; }, 850);
  }

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isTransitioning) return;
    if (e.deltaY > 15 && current < TOTAL - 1) goToPanel(current + 1);
    else if (e.deltaY < -15 && current > 0) goToPanel(current - 1);
  }, { passive: false });

  let touchStartY = 0;
  container.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
  container.addEventListener('touchend', (e) => {
    if (isTransitioning) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 50) return;
    if (dy > 0 && current < TOTAL - 1) goToPanel(current + 1);
    else if (dy < 0 && current > 0) goToPanel(current - 1);
  }, { passive: true });

  goToPanel(0, false);
}

// -- Inspiration image modal (see openInspoModal / closeInspoModal below search results) --

// -- Saved / Bookmarks Page ------------------------------------
function renderCatalogue() {
  const el = document.getElementById('page-catalogue');

  // ── Section A: Saved Inspiration ─────────────────────────────────────────
  // Source: da_saved_inspiration — tag-variant cards bookmarked from For You
  const savedInspo = getSavedInspo();

  // Build an id → imageUrl lookup from all sources so we can
  // display the actual artwork in the mosaic
  const tagCardImgLookup = {};
  FY_TAG_CARDS.forEach(c => { tagCardImgLookup[c.id] = c.imageUrl; });
  // Also include INSPO_DATA items (saved from Browse/Search)
  if (Array.isArray(INSPO_DATA)) {
    INSPO_DATA.forEach(item => { if (item.imageUrl) tagCardImgLookup[item.id] = item.imageUrl; });
  }

  // ── Section B: Saved Assignments ─────────────────────────────────────────
  // Single source of truth: da_saved_assignments (synced by both toggleBookmark and toggleForYouBookmark)
  const mergedAssign = getSavedAssignments();

  // ── Section C: Saved Plans ──────────────────────────────────────────────
  const savedPlans = getSavedPlans();

  const hasInspo     = savedInspo.length > 0;
  const hasExercises = mergedAssign.length > 0;
  const hasPlans     = savedPlans.length > 0;

  // ── Tab nav header (built once, reused below) ─────────────────────────────
  const savedNavHeader = `
    <div class="saved-nav">
      <div class="saved-nav__title-row">
        <div class="grid-container">
          <span class="saved-nav__title">Catalogue</span>
        </div>
      </div>
      <div class="saved-nav__tabs-row">
        <div class="settings-tabs__inner" role="tablist">
          <button class="settings-tab pressable" data-tab="inspiration"
                  role="tab" onclick="switchCatalogueTab('inspiration')">Inspiration</button>
          <button class="settings-tab pressable" data-tab="exercises"
                  role="tab" onclick="switchCatalogueTab('exercises')">Exercises</button>
          <button class="settings-tab pressable" data-tab="plans"
                  role="tab" onclick="switchCatalogueTab('plans')">Plans</button>
        </div>
      </div>
    </div>`;

  // Fully empty state
  if (!hasInspo && !hasExercises && !hasPlans) {
    el.innerHTML = `${savedNavHeader}
      <div class="saved-empty">
        <div class="saved-empty__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 4h14v17l-7-4-7 4V4z"/>
          </svg>
        </div>
        <div class="saved-empty__title">Nothing saved yet</div>
        <div class="saved-empty__subtitle">Bookmark inspiration from your feed, or save exercises to watch later.</div>
        <button class="saved-empty__btn pressable" onclick="handleBottomNav('inspo')">Explore Feed</button>
      </div>
    `;
    switchCatalogueTab(currentCatalogueTab);
    return;
  }

  // ── Saved Inspiration section — mosaic tile grid ─────────────────────────
  // Build a results array so the inspo modal can navigate through saved items
  const savedInspoItems = savedInspo.map(item => ({
    id: item.id,
    title: item.title || '',
    subtitle: item.subtitle || '',
    imageUrl: tagCardImgLookup[item.id] || item.imageUrl || null,
    _sectionTitle: item.category || '',
  }));
  window._inspoResults = savedInspoItems;

  const inspoPlaceholders = ['#c9cdd4','#b8bfc9','#d4cec9','#c4cfc4','#cdc4c4','#c4c9cd','#cdc9c4','#c4cdc9'];
  const inspoSection = hasInspo ? `
    <div class="saved-section">
      <div class="saved-section__count-row"><span class="saved-section__count">${savedInspo.length}</span></div>
      <div class="inspo-mosaic">
        ${savedInspo.map((item, idx) => {
          const imgUrl = tagCardImgLookup[item.id] || item.imageUrl || null;
          const tileStyle = imgUrl ? '' : `background:${inspoPlaceholders[idx % inspoPlaceholders.length]};`;
          return `
          <div class="inspo-mosaic__tile pressable" style="${tileStyle}"
               data-action="open-inspo" data-index="${idx}">
            ${imgUrl ? `<img src="${safeImgUrl(imgUrl)}" alt="" loading="lazy" draggable="false" />` : ''}
            <button class="inspo-mosaic__remove pressable"
              data-action="remove-inspo" data-id="${item.id}"
              aria-label="Remove from saved">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 4h14v17l-7-4-7 4V4z"/>
              </svg>
            </button>
          </div>`;
        }).join('')}
      </div>
    </div>` : `
    <div class="saved-section">
      <div class="saved-section__empty">
        <span>Bookmark tag cards from your Inspo feed to save inspiration here.</span>
        <button class="saved-section__empty-btn pressable" onclick="handleBottomNav('inspo')">Go to Feed</button>
      </div>
    </div>`;

  // ── Saved Assignments section ─────────────────────────────────────────────
  const exercisesSection = hasExercises ? `
    <div class="saved-section">
      <div class="saved-section__count-row"><span class="saved-section__count">${mergedAssign.length}</span></div>
      <div class="saved-list">
        ${mergedAssign.map(item => `
          <div class="saved-item pressable"
               data-action="open-exercise" data-exercise-id="${item.id}" data-category-id="${item.catId || ''}">
            <div class="saved-item__thumb saved-item__thumb--assignment">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div class="saved-item__content">
              <div class="saved-item__title">${item.title}</div>
              <div class="saved-item__meta">
                <span class="saved-item__category">${item.category}</span>
                ${item.duration ? `<span class="saved-item__dot">&middot;</span><span class="saved-item__duration">${item.duration}</span>` : ''}
              </div>
            </div>
            <button class="saved-item__remove pressable"
              data-action="remove-exercise" data-id="${item.id}"
              aria-label="Remove">
              <svg width="18" height="18" viewBox="0 0 16 20" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M2 2h12v16l-6-4-6 4V2z"/></svg>
            </button>
          </div>`).join('')}
      </div>
    </div>` : `
    <div class="saved-section">
      <div class="saved-section__empty">
        <span>Bookmark exercise cards from your feed to save them here.</span>
        <button class="saved-section__empty-btn pressable" onclick="handleBottomNav('exercises')">Browse Exercises</button>
      </div>
    </div>`;

  // ── Saved Plans section ──────────────────────────────────────────────────
  const plansSection = hasPlans ? `
    <div class="saved-section">
      <div class="saved-section__count-row"><span class="saved-section__count">${savedPlans.length}</span></div>
      <div class="saved-plans-list">
        ${savedPlans.map((plan, pIdx) => {
          const dateStr = new Date(plan.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `
          <div class="saved-plan" data-plan-index="${pIdx}">
            <div class="saved-plan__header pressable" onclick="toggleSavedPlanExpand(this)">
              <div class="saved-plan__info">
                <div class="saved-plan__title">${plan.minutes}-min plan</div>
                <div class="saved-plan__meta">${plan.exerciseCount} exercises &middot; ${plan.totalTime} min total &middot; ${dateStr}</div>
              </div>
              <div class="saved-plan__actions">
                <button class="saved-plan__remove pressable" onclick="event.stopPropagation(); removeSavedPlan('${plan.id}')" aria-label="Remove plan">
                  <svg width="18" height="18" viewBox="0 0 16 20" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M2 2h12v16l-6-4-6 4V2z"/></svg>
                </button>
                <span class="saved-plan__chevron">${ICONS.chevronRight || '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'}</span>
              </div>
            </div>
            <div class="saved-plan__exercises" style="display:none;">
              ${(plan.exercises || []).map((ex, i) => `
                <div class="saved-plan__exercise">
                  <span class="saved-plan__exercise-num">${i + 1}</span>
                  <div class="saved-plan__exercise-info">
                    <span class="saved-plan__exercise-title">${ex.title}</span>
                    <span class="saved-plan__exercise-meta">${ex.category || ''} &middot; ${ex.duration}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : `
    <div class="saved-section">
      <div class="saved-section__empty">
        <span>Generate a lesson plan from the Exercises page and save it here.</span>
        <button class="saved-section__empty-btn pressable" onclick="handleBottomNav('exercises')">Go to Exercises</button>
      </div>
    </div>`;

  el.innerHTML = `${savedNavHeader}
    <div class="grid-container">
      <div class="saved-panel" data-panel="inspiration" data-count="${savedInspo.length}">
        ${inspoSection}
      </div>
      <div class="saved-panel" data-panel="exercises" data-count="${mergedAssign.length}">
        ${exercisesSection}
      </div>
      <div class="saved-panel" data-panel="plans" data-count="${savedPlans.length}">
        ${plansSection}
      </div>
    </div>
  `;

  // Restore (or set) active tab — runs after innerHTML is written
  switchCatalogueTab(currentCatalogueTab);

  // Event delegation for saved page actions (avoids inline onclick with interpolated strings)
  el.addEventListener('click', function _savedDelegate(e) {
    const removeInspo = e.target.closest('[data-action="remove-inspo"]');
    if (removeInspo) {
      e.stopPropagation();
      const id = removeInspo.dataset.id;
      const saved = getSavedInspo().filter(s => s.id !== id);
      localStorage.setItem(SAVED_INSPO_KEY, JSON.stringify(saved));
      renderCatalogue();
      return;
    }

    const openInspo = e.target.closest('[data-action="open-inspo"]');
    if (openInspo && openInspo.dataset.index !== undefined) {
      openInspoModal(parseInt(openInspo.dataset.index, 10));
      return;
    }

    const removeEx = e.target.closest('[data-action="remove-exercise"]');
    if (removeEx) {
      e.stopPropagation();
      toggleBookmark(removeEx.dataset.id);
      renderCatalogue();
      return;
    }

    const openEx = e.target.closest('[data-action="open-exercise"]');
    if (openEx && !e.target.closest('[data-action="remove-exercise"]')) {
      const exId = openEx.dataset.exerciseId;
      const catId = openEx.dataset.categoryId;
      if (catId) {
        navigateTo('page-video', renderVideoPlayer, { exerciseId: exId, categoryId: catId });
      } else {
        handleBottomNav('exercises');
      }
    }
  });
}

function toggleSavedPlanExpand(headerEl) {
  const plan = headerEl.closest('.saved-plan');
  const exercises = plan.querySelector('.saved-plan__exercises');
  const chevron = plan.querySelector('.saved-plan__chevron');
  const isOpen = exercises.style.display !== 'none';
  exercises.style.display = isOpen ? 'none' : 'flex';
  if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(90deg)';
}

function removeSavedPlan(planId) {
  const plans = getSavedPlans().filter(p => p.id !== planId);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
  renderCatalogue();
}

// -- Exercise Detail Page --------------------------------------
function renderExerciseDetail(data) {
  const cat = APP_DATA.categories.find(c => c.id === data.categoryId);
  const ex = cat.exercises.find(e => e.id === data.exerciseId);
  const el = document.getElementById('page-detail');

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <button class="nav-bar__back pressable" onclick="goBack()">${ICONS.chevronLeft}</button>
        <span class="nav-bar__title">${ex.category}</span>
      </div>
    </div>
    <div class="detail-hero"></div>
    <div class="detail-content-grid">
      <div class="detail-main">
        <div class="detail-title-block">
          <h1>${ex.title}</h1>
          <div class="category-name">${ex.category}</div>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-duration">
          ${ICONS.clock}
          <span>${ex.duration}</span>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-category-intro">
          <div class="detail-category-intro__tag">${ex.categoryTag}</div>
          <div class="detail-category-intro__heading">Welcome to creating depth</div>
          <div class="detail-category-intro__body">${ex.steps[0] || ''}</div>
        </div>
        <button class="detail-start-btn pressable" onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })">Start Exercise</button>
      </div>
    </div>
  `;
}

// -- Video Player Page -----------------------------------------
let videoState = {
  isPlaying: false,
  progress: 0,
  isComplete: false,
  isStepsExpanded: false,
  timer: null,
  nativeVideoEl: null
};

function videoAreaHTML(ex, overlayId) {
  const media = resolveMedia(ex.videoUrl || null);
  if (!media) {
    return `<div class="video-overlay" id="${overlayId}"><span class="video-overlay__icon">${ICONS.play}</span></div>`;
  }
  if (media.type === 'video') {
    return `
      <video class="video-embed video-embed--native" id="native-video-${overlayId}"
             src="${media.src}" preload="metadata" playsinline></video>
      <div class="video-overlay" id="${overlayId}"><span class="video-overlay__icon">${ICONS.play}</span></div>`;
  }
  // iframe-based: youtube, vimeo, instagram, or generic
  return `
    <div class="video-embed-container">
      <iframe class="video-embed video-embed--iframe"
              src="${media.embedUrl || media.src}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"></iframe>
    </div>`;
}

function renderVideoPlayer(data) {
  const cat = APP_DATA.categories.find(c => c.id === data.categoryId);
  const ex = cat.exercises.find(e => e.id === data.exerciseId);
  const exIdx = cat.exercises.findIndex(e => e.id === data.exerciseId);
  const nextEx = exIdx < cat.exercises.length - 1 ? cat.exercises[exIdx + 1] : null;
  const totalSeconds = parseDuration(ex.duration);
  const position = exIdx + 1;

  // Resolve media up front so template can use it in both slots
  const exMedia = resolveMedia(ex.videoUrl || null);
  const isIframe = exMedia && exMedia.type !== 'video';
  videoState.nativeVideoEl = null; // reset on each render

  clearInterval(videoState.timer);
  videoState = { isPlaying: false, progress: 0, isComplete: false, isStepsExpanded: false, isDrawerOpen: false, timer: null, nativeVideoEl: null };

  const stepsHTML = ex.steps.map((step, i) => `
    <div class="step-item">
      <div class="step-item__label">Step ${i + 1}:</div>
      <div class="step-item__text">${step}</div>
    </div>
  `).join('');

  const playbackControlsHTML = `
    <div class="playback-controls">
      <div class="time-icons-row">
        <span class="time-code" id="time-display">00:00 / ${formatTime(totalSeconds)}</span>
        <div class="time-icons-row__right">
          <button class="icon-btn pressable" id="video-bookmark-btn" onclick="toggleBookmark('${ex.id}')">${bookmarks.has(ex.id) ? ICONS.bookmarkFill : ICONS.bookmark}</button>
          <button class="icon-btn pressable">${ICONS.speaker}</button>
        </div>
      </div>
      <div class="scrubber-row">
        <button class="play-btn pressable" id="play-btn" onclick="toggleVideoPlay('${data.exerciseId}', '${data.categoryId}', ${totalSeconds})">${ICONS.play}</button>
        <input type="range" class="scrubber" id="scrubber" min="0" max="1000" value="0"
          oninput="seekVideo(this.value, ${totalSeconds})">
      </div>
    </div>
  `;

  const titleSectionHTML = ``;

  const drawerDetailHTML = `
    <div class="drawer-detail" id="drawer-detail">
      <div class="drawer-detail__duration">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.75"/><polyline points="12,6 12,12 15.5,14.5"/></svg>
        <span class="drawer-detail__duration-text">${ex.duration}</span>
      </div>
      <div class="drawer-detail__intro">
        <div class="drawer-detail__tag">${ex.categoryTag}</div>
        <div class="drawer-detail__heading">Welcome to creating depth</div>
        <div class="drawer-detail__body">${ex.steps[0] || ''}</div>
      </div>
    </div>
    <div class="drawer-steps" id="drawer-steps">
      ${stepsHTML}
    </div>
  `;

  const completionHTML = `
    <div class="completion-section" id="completion-section">
      ${nextEx ? `
        <div class="completion__label">EXERCISE COMPLETE</div>
        <div class="completion__next-title">Up next: ${nextEx.title}</div>
        <button class="completion__next-btn pressable" onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${nextEx.id}', categoryId: '${cat.id}' })">
          Next Exercise ${ICONS.arrowRight}
        </button>
      ` : `
        <div class="completion__category-done">
          <div class="completion__trophy">${ICONS.trophy}</div>
          <div class="completion__done-title">Category Complete</div>
          <div class="completion__done-subtitle">${cat.title}</div>
          <button class="completion__done-btn pressable" onclick="stopVideo(); goBack()">Done</button>
        </div>
      `}
    </div>
  `;

  const navBarIcons = `
    <div class="video-nav-bar__icons">
      <div class="video-nav-bar__item pressable" onclick="stopVideo(); handleBottomNav('inspo')">
        ${ICONS.rocketLaunch}
        <span>Inspo</span>
      </div>
      <div class="video-nav-bar__item pressable" onclick="stopVideo(); handleBottomNav('home')">
        ${ICONS.home}
        <span>Home</span>
      </div>
      <div class="video-nav-bar__item pressable" onclick="stopVideo(); handleBottomNav('search')">
        ${ICONS.search}
        <span>Browse</span>
      </div>
      <div class="video-nav-bar__item pressable" onclick="stopVideo(); handleBottomNav('catalogue')">
        ${ICONS.bookmark}
        <span>Catalogue</span>
      </div>
      <div class="video-nav-bar__item active pressable" onclick="stopVideo(); handleBottomNav('exercises')">
        ${ICONS.book}
        <span>Exercises</span>
      </div>
    </div>
  `;

  const el = document.getElementById('page-video');
  el.innerHTML = `
    <!-- Top bar (back + title, sits above video area) -->
    <div class="nav-bar">
      <div class="grid-container">
        <button class="nav-bar__back pressable" onclick="stopVideo(); goBack()">${ICONS.chevronLeft}</button>
        <span class="nav-bar__title">${ex.title}</span>
      </div>
    </div>

    <!-- Mobile: video area -->
    <div class="video-area${isIframe ? ' video-area--iframe' : ''}" id="video-tap-area">
      ${videoAreaHTML(ex, 'video-overlay')}
    </div>

    <!-- Mobile: bottom drawer -->
    <div class="video-bottom-drawer collapsed" id="video-drawer">
      <div class="drawer-handle" id="drawer-handle">
        <div class="drawer-handle__bar"></div>
      </div>
      <div class="drawer-scroll">
        ${playbackControlsHTML}
        ${titleSectionHTML}
        ${drawerDetailHTML}
        ${completionHTML}
      </div>
    </div>

    <!-- Desktop: grid layout -->
    <div class="video-desktop-layout" id="desktop-layout">
      <!-- Video card (left / full-width) -->
      <div class="video-card">
        <div class="video-card__inner">
          <div class="video-area${isIframe ? ' video-area--iframe' : ''}" id="video-tap-area-desktop">
            ${videoAreaHTML(ex, 'video-overlay-desktop')}
          </div>
          <div class="playback-controls" id="desktop-playback">
            <div class="time-icons-row">
              <span class="time-code" id="time-display-desktop">00:00 / ${formatTime(totalSeconds)}</span>
              <div class="time-icons-row__right">
                <button class="icon-btn pressable">${ICONS.gear}</button>
                <button class="icon-btn pressable">${ICONS.speaker}</button>
              </div>
            </div>
            <div class="scrubber-row">
              <button class="play-btn pressable" id="play-btn-desktop" onclick="toggleVideoPlay('${data.exerciseId}', '${data.categoryId}', ${totalSeconds})">${ICONS.play}</button>
              <input type="range" class="scrubber" id="scrubber-desktop" min="0" max="1000" value="0"
                oninput="seekVideo(this.value, ${totalSeconds})">
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer side panel (right, spans both rows when open) -->
      <div class="video-drawer-side" id="desktop-drawer-side">
        <div class="video-drawer-side__inner">
          <div>
            <div class="video-drawer-peek__title-row" onclick="toggleDesktopDrawer()" style="cursor:pointer;">
              <div class="drawer-detail__title">${ex.title}</div>
              <span class="video-title-section__chevron chevron-down">
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 8 7 1 13 8"/></svg>
              </span>
            </div>
            <div class="drawer-detail__category">${ex.category}</div>
            <div class="drawer-detail__duration">
              <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#6a7282;fill:none;stroke-width:1.5"><circle cx="12" cy="12" r="9.75"/><polyline points="12,6 12,12 15.5,14.5"/></svg>
              <span class="drawer-detail__duration-text">${ex.duration}</span>
            </div>
            <div class="drawer-detail__intro">
              <div class="drawer-detail__tag">${ex.categoryTag}</div>
              <div class="drawer-detail__heading">Welcome to creating depth</div>
              <div class="drawer-detail__body">${ex.steps[0] || ''}</div>
            </div>
          </div>
          <div>
            ${stepsHTML}
          </div>
        </div>
      </div>

      <!-- Nav bar (bottom-left) -->
      <div class="video-nav-bar">
        ${navBarIcons}
      </div>

      <!-- Collapsed drawer peek (bottom-right, shown when closed) -->
      <div class="video-drawer-peek" id="desktop-drawer-peek" onclick="toggleDesktopDrawer()">
        <div class="video-drawer-peek__title-row">
          <div class="drawer-detail__title" style="font-size:22px; line-height:28px;">${ex.title}</div>
          <span class="video-title-section__chevron" id="desktop-drawer-chevron">
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 8 7 1 13 8"/></svg>
          </span>
        </div>
        <div class="drawer-detail__category" style="margin-top:4px;">${ex.category}</div>
      </div>
    </div>
  `;

  // Hide mock controls for iframe embeds; wire native video element
  if (isIframe) {
    const mobileControls = document.querySelector('#video-drawer .playback-controls');
    if (mobileControls) mobileControls.style.display = 'none';
    const desktopPlayback = document.getElementById('desktop-playback');
    if (desktopPlayback) desktopPlayback.style.display = 'none';
  } else if (exMedia && exMedia.type === 'video') {
    videoState.nativeVideoEl = document.getElementById('native-video-video-overlay')
      || document.getElementById('native-video-video-overlay-desktop');
  }

  // Mobile: video tap handler
  const mobileTap = document.getElementById('video-tap-area');
  if (mobileTap) {
    mobileTap.addEventListener('click', (e) => {
      if (e.target.closest('.nav-bar')) return;
      if (videoState.isComplete) {
        videoState.isComplete = false;
        videoState.progress = 0;
        updateVideoUI(totalSeconds);
        startVideoTimer(totalSeconds);
      } else {
        toggleVideoPlay(data.exerciseId, data.categoryId, totalSeconds);
      }
    });
  }

  // Desktop: video tap handler
  const desktopTap = document.getElementById('video-tap-area-desktop');
  if (desktopTap) {
    desktopTap.addEventListener('click', (e) => {
      if (videoState.isComplete) {
        videoState.isComplete = false;
        videoState.progress = 0;
        updateVideoUI(totalSeconds);
        startVideoTimer(totalSeconds);
      } else {
        toggleVideoPlay(data.exerciseId, data.categoryId, totalSeconds);
      }
    });
  }

  // Mobile drawer: drag-to-open
  setupDrawerDrag();
}

function toggleVideoPlay(exId, catId, totalSeconds) {
  if (videoState.isComplete) {
    videoState.isComplete = false;
    videoState.progress = 0;
    updateVideoUI(totalSeconds);
    startVideoTimer(totalSeconds);
    return;
  }
  videoState.isPlaying = !videoState.isPlaying;
  // Sync native <video> element if present
  if (videoState.nativeVideoEl) {
    videoState.isPlaying ? videoState.nativeVideoEl.play() : videoState.nativeVideoEl.pause();
  }
  if (videoState.isPlaying) {
    startVideoTimer(totalSeconds);
  } else {
    clearInterval(videoState.timer);
  }
  updateVideoUI(totalSeconds);
}

function startVideoTimer(totalSeconds) {
  clearInterval(videoState.timer);
  videoState.isPlaying = true;
  videoState.timer = setInterval(() => {
    videoState.progress += 1 / totalSeconds;
    if (videoState.progress >= 1) {
      videoState.progress = 1;
      videoState.isPlaying = false;
      videoState.isComplete = true;
      clearInterval(videoState.timer);
    }
    updateVideoUI(totalSeconds);
  }, 1000);
}

function seekVideo(val, totalSeconds) {
  videoState.progress = val / 1000;
  // Seek native <video> element if present
  if (videoState.nativeVideoEl) {
    videoState.nativeVideoEl.currentTime = videoState.progress * (videoState.nativeVideoEl.duration || 0);
  }
  if (videoState.progress >= 1) {
    videoState.isComplete = true;
    videoState.isPlaying = false;
    clearInterval(videoState.timer);
  } else if (videoState.isComplete) {
    videoState.isComplete = false;
  }
  updateVideoUI(totalSeconds);
}

function updateVideoUI(totalSeconds) {
  const currentSec = videoState.progress * totalSeconds;
  const timeStr = `${formatTime(currentSec)} / ${formatTime(totalSeconds)}`;
  const btnIcon = videoState.isComplete ? ICONS.replay : (videoState.isPlaying ? ICONS.pause : ICONS.play);

  // Update both mobile and desktop elements
  ['time-display', 'time-display-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = timeStr;
  });
  ['scrubber', 'scrubber-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = Math.round(videoState.progress * 1000);
  });
  ['play-btn', 'play-btn-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = btnIcon;
  });
  ['video-overlay', 'video-overlay-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (videoState.isComplete) {
        el.innerHTML = `<span class="video-overlay__icon">\u2705</span><span class="video-overlay__text">Tap to Replay</span>`;
        el.style.display = '';
      } else if (!videoState.isPlaying) {
        el.innerHTML = `<span class="video-overlay__icon">${ICONS.play}</span>`;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });

  const completion = document.getElementById('completion-section');
  if (completion) {
    completion.classList.toggle('visible', videoState.isComplete);
  }
}

// -- Mobile drawer toggle/drag --------------------------------
function toggleDrawer() {
  const drawer = document.getElementById('video-drawer');
  if (!drawer) return;
  videoState.isDrawerOpen = !videoState.isDrawerOpen;
  drawer.classList.toggle('collapsed', !videoState.isDrawerOpen);
  drawer.classList.toggle('expanded', videoState.isDrawerOpen);
  const detail = document.getElementById('drawer-detail');
  const steps = document.getElementById('drawer-steps');
  if (detail) detail.classList.toggle('visible', videoState.isDrawerOpen);
  if (steps) steps.classList.toggle('visible', videoState.isDrawerOpen);
}

function setupDrawerDrag() {
  const drawer = document.getElementById('video-drawer');
  const handle = document.getElementById('drawer-handle');
  if (!drawer || !handle) return;

  let startY = 0, startTranslate = 0, dragging = false;

  handle.addEventListener('touchstart', (e) => {
    dragging = true;
    startY = e.touches[0].clientY;
    drawer.style.transition = 'none';
    const rect = drawer.getBoundingClientRect();
    startTranslate = rect.top - (window.innerHeight - drawer.offsetHeight);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY;
    const maxTranslate = drawer.offsetHeight - 180;
    const translate = Math.max(0, Math.min(maxTranslate, startTranslate + dy));
    drawer.style.transform = `translateY(${translate}px)`;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    drawer.style.transition = '';
    const rect = drawer.getBoundingClientRect();
    const threshold = window.innerHeight * 0.5;
    if (rect.top < threshold) {
      videoState.isDrawerOpen = true;
      drawer.classList.remove('collapsed');
      drawer.classList.add('expanded');
    } else {
      videoState.isDrawerOpen = false;
      drawer.classList.add('collapsed');
      drawer.classList.remove('expanded');
    }
    drawer.style.transform = '';
    const detail = document.getElementById('drawer-detail');
    const steps = document.getElementById('drawer-steps');
    if (detail) detail.classList.toggle('visible', videoState.isDrawerOpen);
    if (steps) steps.classList.toggle('visible', videoState.isDrawerOpen);
  });

  // Also allow click on handle to toggle
  handle.addEventListener('click', toggleDrawer);
}

// -- Desktop drawer toggle ------------------------------------
function toggleDesktopDrawer() {
  const layout = document.getElementById('desktop-layout');
  if (!layout) return;

  videoState.isDrawerOpen = !videoState.isDrawerOpen;
  layout.classList.toggle('drawer-open', videoState.isDrawerOpen);

  // Rotate chevron to indicate drawer state
  const chevron = document.getElementById('desktop-drawer-chevron');
  if (chevron) chevron.classList.toggle('chevron-down', videoState.isDrawerOpen);
}

function startExerciseFromDrawer(totalSeconds, exId, catId) {
  toggleDesktopDrawer();
  toggleVideoPlay(exId, catId, totalSeconds);
}

function stopVideo() {
  clearInterval(videoState.timer);
  videoState = { isPlaying: false, progress: 0, isComplete: false, isStepsExpanded: false, isDrawerOpen: false, timer: null, nativeVideoEl: null };
}

// -- Article Page ----------------------------------------------
function renderArticle() {
  const article = APP_DATA.article;
  const el = document.getElementById('page-article');
  const expandedSections = new Set();

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <button class="nav-bar__back pressable" onclick="goBack()">${ICONS.chevronLeft}</button>
        <span class="nav-bar__title">${article.title}</span>
      </div>
    </div>
    <div class="article-content-grid">
      <div class="article-main">
        <div class="article-placeholder"></div>
        <div class="article-title-block">
          <h1>${article.title}</h1>
          <div class="subtitle">${article.subtitle}</div>
        </div>
        <div id="article-sections">
          ${article.sections.map(section => {
            const isExpandable = section.content !== null || section.readTime !== null;
            return `
              <div class="article-section-row">
                <button class="article-section-row__header ${isExpandable ? 'clickable pressable' : ''}"
                  ${isExpandable ? `onclick="toggleArticleSection('${section.id}')"` : ''}>
                  <span class="article-section-row__title">${section.title}</span>
                  ${isExpandable ? `<span class="article-section-row__chevron" id="art-chevron-${section.id}">${ICONS.chevronRight}</span>` : ''}
                </button>
                ${isExpandable ? `
                  <div class="article-section-row__content" id="art-content-${section.id}">
                    ${section.readTime ? `
                      <div class="article-section-row__read-time">
                        ${ICONS.book}
                        <span>${section.readTime}</span>
                      </div>
                    ` : ''}
                    ${section.content ? (() => {
                      const parts = section.content.split('\n\n');
                      return `
                        ${parts[0] ? `<div class="article-section-row__heading">${parts[0]}</div>` : ''}
                        ${parts.length > 1 ? `<div class="article-section-row__body">${parts.slice(1).join('<br><br>')}</div>` : ''}
                      `;
                    })() : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  el._expandedSections = expandedSections;
}

function toggleArticleSection(sectionId) {
  const el = document.getElementById('page-article');
  const expanded = el._expandedSections;
  const contentEl = document.getElementById(`art-content-${sectionId}`);
  const chevron = document.getElementById(`art-chevron-${sectionId}`);

  if (expanded.has(sectionId)) {
    expanded.delete(sectionId);
    contentEl.classList.remove('open');
    chevron.classList.remove('expanded');
  } else {
    expanded.add(sectionId);
    contentEl.classList.add('open');
    chevron.classList.add('expanded');
  }
}

// -- Explore / Search Page --------------------------------------
const EXPLORE_ICONS = {
  // Category
  'brush': '\uD83C\uDFA8', 'cube': '\uD83D\uDCE6', 'pencil': '\u270F\uFE0F', 'layers': '\uD83D\uDDC2\uFE0F',
  // Technique
  'line': '\u2014', 'gradient': '\u25D3', 'grid': '\u2B1C', 'frame': '\u25A1',
  'sphere': '\u25CF', 'texture': '\u2591', 'eye': '\uD83D\uDC41\uFE0F',
  // Style
  'idea': '\uD83D\uDCA1', 'illustration': '\uD83D\uDD8C\uFE0F', 'photo': '\uD83D\uDCF7', 'shapes': '\u25B2',
  // Decade
  'classic': '\uD83C\uDFDB\uFE0F', 'palette': '\uD83C\uDFA8', 'abstract': '\u25CE', 'now': '\u2728',
  // Career
  'film': '\uD83C\uDFAC', 'pen-nib': '\uD83D\uDD8A\uFE0F', 'gamepad': '\uD83C\uDFAE',
  'building': '\uD83C\uDFD7\uFE0F', 'layout': '\uD83D\uDDD4\uFE0F',
  // Theme
  'user': '\uD83D\uDC64', 'mountain': '\u26F0\uFE0F', 'vase': '\uD83C\uDFFA',
  'figure': '\uD83E\uDDD1\u200D\uD83C\uDFA8', 'leaf': '\uD83C\uDF3F',
  // Skill
  'seedling': '\uD83C\uDF31', 'grow': '\uD83C\uDF3E', 'star': '\u2B50'
};

let exploreFilters = new Map(); // key: filterValue, value: { key, label, section }
let searchChips = [];            // [{id, display}] — max 5 selected autocomplete chips
let chipSearchExecuted = false;  // true after user taps the search arrow
let keywordIndex = [];           // [{id, display}] — built once per renderSearch()
let chipMode = 'free';           // 'free' | 'guided'
let guidedStack = [];            // [{id, display, level}]  level: 'L1'|'L2'|'mood'

/**
 * Build a deduplicated, sorted keyword index from all exercise metadata,
 * explore section labels, and inspiration metadata.
 */
function buildKeywordIndex(allExercises, exploreSections) {
  const kw = new Map(); // lowercased → display label
  const add = (raw) => {
    if (!raw) return;
    const key = raw.toLowerCase().replace(/-/g, ' ').trim();
    if (!key) return;
    // Capitalise first letter of each word for display
    const display = key.replace(/\b\w/g, c => c.toUpperCase());
    if (!kw.has(key)) kw.set(key, display);
  };

  // -- Exercise tags --
  allExercises.forEach(ex => {
    add(ex.category);
    add(ex.categoryTag);
    if (!ex.tags) return;
    (ex.tags.searchKeywords || []).forEach(add);
    (ex.tags.techniqueFamilies || []).forEach(add);
    (ex.tags.toolsRequired || []).forEach(add);
    (ex.tags.learningGoals || []).forEach(add);
    add(ex.tags.skillLevel);
    add(ex.tags.durationBucket);
  });

  // -- Explore section labels & filter values --
  (exploreSections || []).flatMap(s => s.items).forEach(item => {
    add(item.label);
    add(item.filterValue);
  });

  // -- DurationBucket (extended / session not in sample data but in Swift enum) --
  ['quick', 'medium', 'extended', 'session'].forEach(add);

  // -- Taxonomy terms that are defined in the design system but may not yet
  //    appear as standalone values in all tagged data --
  ['manga', 'anime', 'comic art', 'sequential art'].forEach(add);

  // -- Inspiration metadata dimensions (from flat 776-item array) --
  (Array.isArray(INSPO_DATA) ? INSPO_DATA : []).forEach(item => {
    const m = item.metadata;
    if (!m) return;
    (m.industry || []).forEach(add);
    (m.colorPalette || []).forEach(add);
    (m.subjectMatter || []).forEach(add);
    (m.techniqueVisible || []).forEach(add);
    // Index all 3 taxonomy levels individually
    const parsed = item._mediumParsed || parseMediumLevels(m.mediumTags);
    parsed.L0.forEach(add);
    parsed.L1.forEach(add);
    parsed.L2.forEach(add);
  });

  // -- Deduplicate singular/plural and adjective/noun forms --
  // Prefer the shorter (singular/noun) form when both exist.
  const canonicalMap = new Map(); // canonical → [keys that map to it]
  const toCanonical = (key) => {
    // Strip trailing "s" for plural (but not "ss" like "compass")
    if (key.endsWith('s') && !key.endsWith('ss') && kw.has(key.slice(0, -1))) {
      return key.slice(0, -1);
    }
    // Strip trailing "al" for adjective → noun (observational → observation)
    if (key.endsWith('al') && kw.has(key.slice(0, -2))) {
      return key.slice(0, -2);
    }
    return key;
  };

  // Find keys to remove (longer forms that have a shorter canonical match)
  const toRemove = new Set();
  for (const key of kw.keys()) {
    const canon = toCanonical(key);
    if (canon !== key) {
      toRemove.add(key);
    }
  }
  for (const key of toRemove) {
    kw.delete(key);
  }

  return [...kw.entries()]
    .map(([id, display]) => ({ id, display }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/* ── Guided Search Utilities ──────────────────────────────────── */

/**
 * Derive the top L1 taxonomy chips from INSPO_DATA, sorted by frequency.
 * @param {number} limit
 * @returns {Array<{id:string, display:string, count:number}>}
 */
function getL1Chips(limit = 6) {
  const counts = new Map();
  (Array.isArray(INSPO_DATA) ? INSPO_DATA : []).forEach(item => {
    const parsed = item._mediumParsed || parseMediumLevels(item.metadata?.mediumTags);
    parsed.L1.forEach(val => {
      const id = val.toLowerCase().trim();
      if (!counts.has(id)) counts.set(id, { display: val, count: 0 });
      counts.get(id).count++;
    });
  });
  return [...counts.entries()]
    .map(([id, { display, count }]) => ({ id, display, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/**
 * Given the current guidedStack, filter INSPO_DATA to matching items
 * and return the next level of option chips.
 * @param {Array<{id, display, level}>} stack
 * @returns {{ l2: Array, mood: Array }}
 */
function getGuidedOptions(stack) {
  if (!stack.length) return { l2: [], mood: [] };

  const l1Entry = stack.find(s => s.level === 'L1');
  const l2Entry = stack.find(s => s.level === 'L2');

  // Filter items matching ALL locked selections
  const filtered = (Array.isArray(INSPO_DATA) ? INSPO_DATA : []).filter(item => {
    const parsed = item._mediumParsed || parseMediumLevels(item.metadata?.mediumTags);
    const allVals = new Set(parsed.all.map(v => v.toLowerCase().trim()));
    const m = item.metadata || {};
    ['colorPalette', 'subjectMatter', 'techniqueVisible'].forEach(f => {
      (m[f] || []).forEach(v => allVals.add(v.toLowerCase().trim()));
    });
    return stack.every(s => allVals.has(s.id));
  });

  const result = { l2: [], mood: [] };
  const lockedIds = new Set(stack.map(s => s.id));

  if (l1Entry && !l2Entry) {
    const l2Counts = new Map();
    filtered.forEach(item => {
      const parsed = item._mediumParsed || parseMediumLevels(item.metadata?.mediumTags);
      parsed.L2.forEach(val => {
        const id = val.toLowerCase().trim();
        if (lockedIds.has(id)) return; // skip already selected
        if (!l2Counts.has(id)) l2Counts.set(id, { display: val, count: 0 });
        l2Counts.get(id).count++;
      });
    });
    result.l2 = [...l2Counts.entries()]
      .map(([id, { display, count }]) => ({ id, display, count }))
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
  }

  if (l1Entry && l2Entry) {
    const fieldLabels = { colorPalette: 'Style', subjectMatter: 'Subject', techniqueVisible: 'Technique' };
    const moodCounts = { colorPalette: new Map(), subjectMatter: new Map(), techniqueVisible: new Map() };
    filtered.forEach(item => {
      const m = item.metadata || {};
      Object.keys(moodCounts).forEach(field => {
        (m[field] || []).forEach(val => {
          const id = val.toLowerCase().trim();
          if (lockedIds.has(id)) return; // skip already selected
          if (!moodCounts[field].has(id)) moodCounts[field].set(id, { display: val, count: 0 });
          moodCounts[field].get(id).count++;
        });
      });
    });
    Object.entries(moodCounts).forEach(([field, map]) => {
      [...map.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8) // up to 8 per field so there's plenty across 10 slots
        .forEach(([id, { display, count }]) => {
          result.mood.push({ id, display, count, field, label: fieldLabels[field] });
        });
    });
  }

  return result;
}

/**
 * Write content into #suggestions-row based on current mode and chip state.
 * @param {string} typedQuery — raw value of the search input
 */
function renderSuggestedSearches(typedQuery) {
  return; // TODO: re-enable preference suggestions in a future release
  const suggestionsRow = document.getElementById('suggestions-row');
  if (!suggestionsRow) return;

  const q = (typedQuery || '').toLowerCase().trim();

  // Free mode only — show preference suggestions below autocomplete when chips are selected
  if (chipMode !== 'free' || searchChips.length === 0) return;

  const excludeIds = new Set(searchChips.map(c => c.id));
  const prefTopics = getRecommendedTopics(excludeIds, 6);
  if (!prefTopics.length) return;

  const prefHtml = `
    <div class="guided-search-container">
      <div class="suggestions-section-label">Based on your preferences</div>
      <div class="guided-options-row">
        ${prefTopics.map(t =>
          `<button class="pref-suggestion-chip pressable"
             onclick="addSearchChip('${t.id.replace(/'/g,"\\'")}','${t.display.replace(/'/g,"\\'")}')">
             ${t.display}
           </button>`
        ).join('')}
      </div>
    </div>`;
  const autoRow = suggestionsRow.querySelector('.autocomplete-chips-row');
  if (autoRow) {
    autoRow.insertAdjacentHTML('afterend', prefHtml);
  } else {
    suggestionsRow.innerHTML = prefHtml;
  }
}

/* ── Synonym / Related Terms Map ─────────────────────────────── */

const SYNONYM_GROUPS = [
  // -- Subject / Design Disciplines --
  ['character design', 'character', 'character art'],
  ['creature design', 'creature', 'monster', 'beast'],
  ['portrait', 'portraits', 'figure', 'figure drawing'],
  ['vehicle design', 'vehicle', 'automotive', 'car design', 'mechanical'],
  ['environment design', 'environment', 'landscape', 'background art', 'scene'],
  ['prop design', 'prop', 'object design', 'asset'],
  ['concept art', 'concept', 'concept design', 'visual development', 'vis dev'],
  ['illustration', 'narrative artwork', 'editorial illustration'],
  // -- Techniques & Fundamentals --
  ['anatomy', 'anatomy fundamentals', 'figure', 'gesture'],
  ['perspective', 'perspective drills', 'spatial reasoning', 'depth'],
  ['line work', 'line control', 'linework heavy', 'contour', 'line art'],
  ['painterly', 'loose', 'expressive', 'brushwork'],
  ['detailed', 'refined', 'polished', 'tight rendering'],
  ['graphic', 'stylized', 'flat design'],
  // -- Color --
  ['warm', 'warm colors', 'warm palette'],
  ['cool', 'cool colors', 'cool palette'],
  ['vibrant', 'saturated', 'bold colors', 'high contrast'],
  ['muted', 'desaturated', 'subtle', 'pastel'],
  ['color theory', 'color', 'color palette', 'complementary'],
  // -- Media --
  ['digital painting', 'digital art', 'digital 2d'],
  ['comic art', 'comics', 'sequential art', 'western comics', 'graphic novel'],
  ['manga', 'anime', 'japanese illustration', 'manhwa'],
  ['matte painting', 'matte', 'background painting'],
  ['vector art', 'vector', 'vector illustration'],
  ['speedpainting', 'speed painting', 'quick paint'],
  ['photobashing', 'photo manipulation', 'composite'],
  ['technical illustration', 'technical drawing', 'diagram'],
  ['pencil', 'graphite', 'traditional', 'paper only'],
  ['ink', 'inking', 'pen and ink', 'crosshatch'],
  ['watercolor', 'watercolour', 'wash', 'wet media'],
  // -- 3D --
  ['3d digital art', '3d art', '3d', 'cg'],
  ['rendering', 'render', 'photorealistic rendering', 'cel shading'],
  ['modeling & sculpting', 'modeling', 'sculpting', '3d sculpting'],
  ['texturing & surfacing', 'texturing', 'surfacing', 'materials'],
  ['animation & rigging', 'animation', 'rigging', 'motion'],
  // -- Industry --
  ['game art', 'game design', 'game artist'],
  ['film & vfx', 'film', 'vfx', 'visual effects'],
  ['industrial design', 'product design'],
  ['automotive design', 'car design', 'vehicle design'],
  ['tv & broadcast', 'tv', 'broadcast', 'television'],
  // -- Career & Learning --
  ['shading', 'value', 'tonal', 'light and shadow'],
  ['composition', 'layout', 'framing', 'visual hierarchy'],
  ['gesture', 'gesture drawing', 'quick sketch', 'warm up'],
  ['freelance illustrator', 'freelance', 'illustration career'],
  ['concept artist', 'concept art career', 'entertainment design'],
  ['sci fi art', 'science fiction', 'futuristic', 'sci fi'],
  ['storytelling', 'narrative', 'storyboard'],
  ['observation', 'observational', 'still life', 'study'],
];

const _synonymLookup = new Map();
SYNONYM_GROUPS.forEach(group => {
  group.forEach(term => {
    const key = term.toLowerCase().replace(/-/g, ' ').trim();
    if (!_synonymLookup.has(key)) _synonymLookup.set(key, new Set());
    group.forEach(related => {
      const rKey = related.toLowerCase().replace(/-/g, ' ').trim();
      if (rKey !== key) _synonymLookup.get(key).add(rKey);
    });
  });
});

function getSynonyms(term) {
  return [...(_synonymLookup.get(term) || [])];
}

/* ── Recommendation Engine ───────────────────────────────────── */

/**
 * Score and rank keywords from keywordIndex based on user signals.
 * @param {Set<string>} excludeIds – chip IDs to exclude from results
 * @param {number} limit – max topics to return (default 8)
 * @returns {Array<{id: string, display: string, score: number}>}
 */
function getRecommendedTopics(excludeIds = new Set(), limit = 8) {
  if (!keywordIndex.length) return [];

  const scores = new Map(); // kw.id -> { score, channels, _counts }

  function addScore(rawTerm, points, channel) {
    const kwId = (rawTerm || '').toLowerCase().replace(/-/g, ' ').trim();
    if (!kwId) return;
    if (!scores.has(kwId)) scores.set(kwId, { score: 0, channels: new Set(), _counts: {} });
    const entry = scores.get(kwId);
    const occ = entry._counts[channel] || 0;
    if (occ >= 3) return; // cap per-channel occurrences
    entry.score += points;
    entry.channels.add(channel);
    entry._counts[channel] = occ + 1;
  }

  // ── Channel 1: Preference match (weight 5) + synonym expansion (weight 3)
  const prefTerms = [
    ...(PREFS.artStyles || []),
    ...(PREFS.careerGoals || []),
    ...(PREFS.tailoredExercises  ? ['tailored exercises'] : []),
    ...(PREFS.anatomyFundamentals ? ['anatomy', 'anatomy fundamentals'] : []),
    ...(PREFS.perspectiveDrills  ? ['perspective', 'perspective drills'] : []),
  ];
  prefTerms.forEach(term => {
    addScore(term, 5, 'pref');
    getSynonyms(term.toLowerCase().replace(/-/g, ' ').trim()).forEach(s => addScore(s, 3, 'pref-syn'));
  });

  // ── Channel 2: Liked items (weight 4)
  const liked = getLikedItems();
  const allExercises = APP_DATA?.categories?.flatMap(c => c.exercises) || [];
  const exById = new Map(allExercises.map(e => [e.id, e]));

  Object.values(liked).forEach(likedItem => {
    const ex = exById.get(likedItem.id);
    if (ex?.tags) {
      [...(ex.tags.searchKeywords || []),
       ...(ex.tags.techniqueFamilies || []),
       ...(ex.tags.learningGoals || []),
      ].forEach(t => addScore(t, 4, 'liked'));
      addScore(ex.category, 4, 'liked');
      addScore(ex.categoryTag, 4, 'liked');
    }
  });

  // ── Channel 3: Saved inspiration patterns (weight 3)
  const savedInspo = getSavedInspo();
  savedInspo.forEach(saved => {
    const item = INSPO_BY_ID.get(saved.id);
    const m = item?.metadata;
    if (!m) return;
    const parsed = item._mediumParsed || parseMediumLevels(m.mediumTags);
    [...(m.industry || []),
     ...(m.colorPalette || []),
     ...(m.subjectMatter || []),
     ...(m.techniqueVisible || []),
     ...parsed.all,
    ].forEach(t => addScore(t, 3, 'saved-inspo'));
  });

  // ── Channel 4: Saved + completed exercises (weight 3)
  const savedAssign = getSavedAssignments();
  const completed = getCompletedExercises();
  [...savedAssign, ...completed].forEach(item => {
    const ex = item.id ? exById.get(item.id) : null;
    if (ex?.tags) {
      [...(ex.tags.searchKeywords || []),
       ...(ex.tags.techniqueFamilies || []),
       ...(ex.tags.learningGoals || []),
      ].forEach(t => addScore(t, 3, 'saved-ex'));
      addScore(ex.category, 3, 'saved-ex');
    }
    if (item.category) addScore(item.category, 3, 'saved-ex');
  });

  // ── Channel 5: Synonym propagation (weight 2) from strong signals
  for (const [kwId, data] of scores) {
    if (data.score >= 5) {
      getSynonyms(kwId).forEach(s => addScore(s, 2, 'synonym'));
    }
  }

  // ── Validate against keywordIndex & rank
  const validIds = new Set(keywordIndex.map(kw => kw.id));
  const kwLookup = new Map(keywordIndex.map(kw => [kw.id, kw.display]));

  return [...scores.entries()]
    .filter(([id]) => validIds.has(id) && !excludeIds.has(id))
    .map(([id, data]) => ({
      id,
      display: kwLookup.get(id),
      score: data.score + (data.channels.size * 0.5),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

// ── Browse Carousels (authenticated) ─────────────────────────────
function renderBrowseCarousels() {
  const l1Categories = getL1Chips(3);
  if (!l1Categories.length || !Array.isArray(INSPO_DATA)) return '';

  window._browseCarouselItems = [];

  return l1Categories.map(cat => {
    const items = INSPO_DATA
      .filter(item => {
        const parsed = item._mediumParsed || parseMediumLevels(item.metadata?.mediumTags);
        return (parsed.L1 || []).some(v => v.toLowerCase().trim() === cat.id) && item.imageUrl;
      })
      .slice(0, 20);
    if (!items.length) return '';

    const startIdx = window._browseCarouselItems.length;
    window._browseCarouselItems.push(...items);

    const cards = items.map((item, i) => `
      <div class="browse-carousel__card dash-scifi-card pressable"
           style="background-image:url('${safeImgUrl(item.imageUrl)}')"
           onclick="openBrowseCarouselModal(${startIdx + i})">
        <div class="browse-carousel__card-label">${(item.title || '').replace(/'/g, "&#39;")}</div>
      </div>`).join('');

    return `
      <section class="dash-section browse-carousel-section">
        <div class="dash-section__header">
          <span class="dash-section__title">${cat.display}</span>
          <button class="dash-section__link pressable"
            onclick="browseViewAll('${cat.id}', '${cat.display.replace(/'/g, "&#39;")}')">View All</button>
        </div>
        <div class="browse-carousel__scroll dash-scifi-scroll">${cards}</div>
      </section>`;
  }).join('');
}

function openBrowseCarouselModal(idx) {
  window._inspoResults = window._browseCarouselItems || [];
  openInspoModal(idx);
}

function browseViewAll(id, display) {
  searchChips = [{ id, display }];
  chipMode = 'free';
  navigateTo('page-search-results', renderSearchResults, { chips: [{ id, display }], query: '' });
}

// ── Search Gate (unauthenticated Browse) ──────────────────────────
function renderSearchGate() {
  const el = document.getElementById('page-search');
  el.style.overflowY = 'auto';
  exploreFilters = new Map();
  chipSearchExecuted = false;
  const allExercises = APP_DATA.categories.flatMap(c => c.exercises);
  const sections = APP_DATA.exploreSections || [];
  keywordIndex = buildKeywordIndex(allExercises, sections);

  el.innerHTML = `
    <div class="search-gate-page">

      <!-- Hero: title, body, search, and chips all in one centered section -->
      <div class="search-gate__hero">
        <nav class="hero-top-nav">
          <div class="hero-top-nav__center">
            <button class="hero-top-nav__link pressable" onclick="handleBottomNav('inspo')">Inspo</button>
            <button class="hero-top-nav__link pressable" onclick="handleBottomNav('home')">Home</button>
            <button class="hero-top-nav__link pressable hero-top-nav__link--active" onclick="handleBottomNav('search')">Browse</button>
            <button class="hero-top-nav__link pressable" onclick="handleBottomNav('catalogue')">Catalogue</button>
            <button class="hero-top-nav__link pressable" onclick="handleBottomNav('exercises')">Exercises</button>
          </div>
          <button class="hero-top-nav__login pressable" onclick="navigateTo('page-auth', renderAuth)">Login</button>
        </nav>
        <div class="search-gate__content">
          <h1 class="search-gate__title">Browse &amp; Explore Our<br>Human-Made Catalogue</h1>
          <p class="search-gate__body">Discover inspiring creative professional and personal work by career type, technique, art style, or genre.</p>
          <div class="search-gate__search-wrapper">
            <div class="search-gate__search-row">
              <div class="explore-search-bar search-gate__search">
                <div class="search-bar-inner">
                  <input type="text" class="search-input" placeholder="Search exercises, techniques, styles..."
                    id="explore-search-input" oninput="onExploreAutocomplete(this.value)"
                    onkeydown="if(event.key==='Enter' && isSearchArrowActive()) executeChipSearch()">
                  <button class="search-bar__arrow" id="search-arrow"
                    onclick="if(isSearchArrowActive()) executeChipSearch()" aria-label="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
                </div>
              </div>
            </div>
            <div class="chip-search-hint-container" id="chip-search-hint"></div>
            <div class="chips-row" id="chips-row"></div>
            <div class="suggestions-row" id="suggestions-row"></div>
          </div>
        </div>
      </div>

      <!-- Carousels + guided search -->
      <div class="grid-container">
        <div id="explore-sections">
          ${renderBrowseCarousels()}
        </div>
        <div id="explore-results"></div>
        <div class="guided-search-bottom">
          <div id="guided-section-row"></div>
        </div>
      </div>

    </div>`;

  updateBottomNavActive('page-search');
  updateBottomNavVisibility('page-search');
  renderChipsRow();
  renderGuidedSection();
}

function renderSearch() {
  if (!currentUser) { renderSearchGate(); return; }

  const el = document.getElementById('page-search');
  el.style.overflowY = '';
  exploreFilters = new Map();
  // Don't reset searchChips here — preserve state when navigating back from results
  chipSearchExecuted = false;

  const sections = APP_DATA.exploreSections || [];
  const allExercises = APP_DATA.categories.flatMap(c => c.exercises);

  // Build the autocomplete keyword index from full taxonomy
  keywordIndex = buildKeywordIndex(allExercises, sections);

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <span class="nav-bar__title">Explore</span>
      </div>
    </div>
    <div class="grid-container">
      <div class="explore-search-bar">
        <div class="search-bar-inner">
          <input type="text" class="search-input" placeholder="Search exercises, techniques, styles..."
            id="explore-search-input" oninput="onExploreAutocomplete(this.value)"
            onkeydown="if(event.key==='Enter' && isSearchArrowActive()) executeChipSearch()">
          <button class="search-bar__arrow" id="search-arrow"
            onclick="if(isSearchArrowActive()) executeChipSearch()" aria-label="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
      </div>
      <div class="chip-search-hint-container" id="chip-search-hint"></div>
      <div class="chips-row" id="chips-row"></div>
      <div class="suggestions-row" id="suggestions-row"></div>
      <div id="explore-sections">
        ${renderBrowseCarousels()}
      </div>
      <div id="explore-results"></div>
      <div class="guided-search-bottom">
        <div id="guided-section-row"></div>
      </div>
    </div>
  `;

  // Re-render chips if returning from search results page (state preserved)
  if (searchChips.length > 0 || (chipMode === 'guided' && guidedStack.length > 0)) {
    renderChipsRow();
    updateSearchArrow();
    toggleExploreSections();
  } else {
    renderChipsRow();
  }
  renderGuidedSection();
}

// -- Autocomplete chip search functions --------------------------

function onExploreAutocomplete(val) {
  // Exit guided mode if user starts typing
  if (chipMode === 'guided' && (val || '').length > 0) exitGuidedMode();

  updateSearchArrow();
  toggleExploreSections();

  const q = (val || '').toLowerCase().trim();
  renderChipsRow(q);
}

function addSearchChip(id, display) {
  if (searchChips.length >= 5) return;
  if (searchChips.some(c => c.id === id)) return;

  searchChips.push({ id, display });
  chipSearchExecuted = false;

  // Clear input and suggestions
  const input = document.getElementById('explore-search-input');
  if (input) input.value = '';
  // renderChipsRow handles clearing suggestions since input is now empty

  renderChipsRow();
  updateSearchArrow();
  toggleExploreSections();
}

function removeSearchChip(id) {
  searchChips = searchChips.filter(c => c.id !== id);
  chipSearchExecuted = false;

  renderChipsRow();
  updateSearchArrow();
  toggleExploreSections();
}

function executeChipSearch() {
  // Guided mode — merge guidedStack into searchChips and navigate
  if (chipMode === 'guided') {
    if (!guidedStack.length) return;
    searchChips = guidedStack.map(s => ({ id: s.id, display: s.display }));
    const query = document.getElementById('explore-search-input')?.value || '';
    navigateTo('page-search-results', renderSearchResults, {
      chips: [...searchChips],
      query: query.trim()
    });
    return;
  }
  // Free mode — if no chips but a full keyword is typed, auto-add it first
  if (searchChips.length === 0) {
    const input = document.getElementById('explore-search-input');
    const q = (input?.value || '').toLowerCase().trim();
    const match = keywordIndex.find(kw => kw.id === q);
    if (match) {
      addSearchChip(match.id, match.display);
    } else {
      return;
    }
  }
  const query = document.getElementById('explore-search-input')?.value || '';
  navigateTo('page-search-results', renderSearchResults, {
    chips: [...searchChips],
    query: query.trim()
  });
}

function renderChipsRow(query) {
  const row = document.getElementById('chips-row');
  const suggestionsRow = document.getElementById('suggestions-row');
  const hintContainer = document.getElementById('chip-search-hint');
  if (!row) return;

  const q = (query || '').toLowerCase().trim();
  const xSvg = '<span class="selected-chip__x"><svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg></span>';
  const searchBar = document.querySelector('.explore-search-bar');

  // ── GUIDED MODE ──────────────────────────────────────────────────
  if (chipMode === 'guided') {
    // Chips and controls live in the bottom guided section — clear the top row
    row.innerHTML = '';
    document.querySelector('.explore-search-bar .clear-all-chips')?.remove();
    document.querySelector('.search-gate__chips .clear-all-chips')?.remove();
    if (hintContainer) hintContainer.innerHTML = '';
    if (suggestionsRow) suggestionsRow.innerHTML = '';
    return;
  }

  // ── FREE MODE ────────────────────────────────────────────────────
  // Selected chips with individual X buttons
  row.innerHTML = searchChips.map(c =>
    `<button class="selected-chip pressable"
       onclick="removeSearchChip('${c.id.replace(/'/g, "\\'")}')">
       ${c.display} ${xSvg}
     </button>`
  ).join('');

  // Autocomplete suggestions (2+ chars typed, under chip limit)
  if (suggestionsRow) {
    if (q.length >= 2 && searchChips.length < 5) {
      const selectedIds = new Set(searchChips.map(c => c.id));
      const matches = keywordIndex
        .filter(kw => kw.id.startsWith(q) && !selectedIds.has(kw.id))
        .slice(0, 10);
      const suggestionHtml = matches.length
        ? matches.map((kw, i) =>
            `<button class="chip suggestion-chip pressable"
               style="animation-delay:${(i * 0.05).toFixed(2)}s"
               onclick="addSearchChip('${kw.id.replace(/'/g, "\\'")}','${kw.display.replace(/'/g, "\\'")}')">${kw.display}</button>`
          ).join('')
        : '';
      const isGate = !!document.querySelector('.search-gate__search-wrapper');
      if (searchChips.length > 0 || isGate) {
        // Inline mode: put suggestions directly into chips-row (gate always uses this to avoid layout shift)
        row.innerHTML += suggestionHtml;
        suggestionsRow.innerHTML = '';
      } else {
        // Authenticated page, no chips yet: show suggestions in the row below
        suggestionsRow.innerHTML = suggestionHtml
          ? `<div class="autocomplete-chips-row">${suggestionHtml}</div>`
          : '';
      }
    } else {
      suggestionsRow.innerHTML = '';
    }
  }

  // Clear all button — inline with search bar on gate, appended to search bar on auth
  document.querySelector('.search-gate__search-row .clear-all-chips')?.remove();
  document.querySelector('.explore-search-bar .clear-all-chips')?.remove();
  if (searchChips.length > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-all-chips pressable';
    clearBtn.textContent = 'Clear all';
    clearBtn.onclick = clearChipSearch;
    const searchRow = document.querySelector('.search-gate__search-row');
    const target = searchRow ?? searchBar;
    if (target) target.appendChild(clearBtn);
  }

  // Hint — suppressed on unauthenticated gate
  const isGate = !!document.querySelector('.search-gate__search-wrapper');
  if (hintContainer) {
    hintContainer.innerHTML = (!isGate && searchChips.length > 0 && !chipSearchExecuted)
      ? '<div class="chip-search-hint">Select one or more chips and click search to get results</div>'
      : '';
  }

  // Preference suggestions or Suggested Searches below autocomplete
  renderSuggestedSearches(q);
}

function isSearchArrowActive() {
  if (chipMode === 'guided') return guidedStack.length >= 1;
  if (searchChips.length > 0) return true;
  const input = document.getElementById('explore-search-input');
  const q = (input?.value || '').toLowerCase().trim();
  if (!q) return false;
  return keywordIndex.some(kw => kw.id === q);
}

function updateSearchArrow() {
  const arrow = document.getElementById('search-arrow');
  if (!arrow) return;
  arrow.classList.toggle('active', isSearchArrowActive());
}

function toggleExploreSections() {
  // Explore sections always remain visible — search operates independently
}

function clearChipSearch() {
  searchChips = [];
  chipMode = 'free';
  guidedStack = [];
  chipSearchExecuted = false;
  const input = document.getElementById('explore-search-input');
  if (input) input.value = '';
  renderChipsRow();
  updateSearchArrow();
  toggleExploreSections();
}

// ── Guided Section (bottom of browse page) ────────────────────────

/** Renders the L1 chip picker or cascading L2/mood options into #guided-section-row. */
function renderGuidedSection() {
  const row = document.getElementById('guided-section-row');
  if (!row) return;

  if (chipMode === 'guided') {
    const options = getGuidedOptions(guidedStack);
    const canSearch = guidedStack.length >= 3;

    // Selected chips + clear all — sit directly above the container
    const chipsHeaderHtml = `
      <div class="guided-chips-header">
        <div class="guided-chips-header__chips">
          ${guidedStack.map(s =>
            `<span class="selected-chip selected-chip--guided">${s.display}</span>`
          ).join('')}
        </div>
        <button class="guided-chips-header__clear pressable" onclick="resetGuidedMode()">Clear all</button>
      </div>`;

    const ctaHtml = `
      <div class="guided-cta-row">
        <button class="guided-cta-btn pressable${canSearch ? '' : ' guided-cta-btn--disabled'}"
          ${canSearch ? 'onclick="executeChipSearch()"' : 'disabled'}>
          View Results ${ICONS.arrowRight}
        </button>
      </div>`;

    if (options.l2.length) {
      row.innerHTML = `
        ${chipsHeaderHtml}
        <div class="guided-search-container">
          <div class="suggestions-section-label">Choose a specialization</div>
          <div class="guided-options-row">
            ${options.l2.map(opt =>
              `<button class="guided-option-chip pressable"
                 onclick="addGuidedChip('${opt.id.replace(/'/g,"\\'")}','${opt.display.replace(/'/g,"\\'")}','L2')">
                 ${opt.display}
               </button>`
            ).join('')}
          </div>
          ${ctaHtml}
        </div>`;
    } else if (options.mood.length) {
      const groups = {};
      options.mood.forEach(m => { if (!groups[m.label]) groups[m.label] = []; groups[m.label].push(m); });
      row.innerHTML = `
        ${chipsHeaderHtml}
        <div class="guided-search-container">
          <div class="suggestions-section-label">Refine further (optional)</div>
          ${Object.entries(groups).map(([label, items]) => `
            <div class="guided-mood-group">
              <span class="guided-mood-group__label">${label}</span>
              <div class="guided-options-row">
                ${items.map(opt =>
                  `<button class="guided-option-chip pressable"
                     onclick="addGuidedChip('${opt.id.replace(/'/g,"\\'")}','${opt.display.replace(/'/g,"\\'")}','mood')">
                     ${opt.display}
                   </button>`
                ).join('')}
              </div>
            </div>`).join('')}
          ${ctaHtml}
        </div>`;
    } else {
      row.innerHTML = `
        ${chipsHeaderHtml}
        <div class="guided-search-container">
          ${ctaHtml}
        </div>`;
    }
    return;
  }

  // Default: show L1 entry chips
  const l1Chips = getL1Chips(6);
  row.innerHTML = l1Chips.length ? `
    <div class="guided-search-container">
      <div class="suggestions-section-label">Guided Search</div>
      <div class="guided-options-row">
        ${l1Chips.map(chip =>
          `<button class="guided-option-chip pressable"
             onclick="enterGuidedMode('${chip.id.replace(/'/g,"\\'")}','${chip.display.replace(/'/g,"\\'")}')">
             ${chip.display}
           </button>`
        ).join('')}
      </div>
    </div>` : '';
}

// ── Guided Mode Action Functions ──────────────────────────────────

/** Enter guided mode when user taps an L1 chip from Guided Search. */
function enterGuidedMode(id, display) {
  chipMode = 'guided';
  guidedStack = [{ id, display, level: 'L1' }];
  searchChips = [];
  chipSearchExecuted = false;
  const input = document.getElementById('explore-search-input');
  if (input) input.value = '';
  renderChipsRow();
  updateSearchArrow();
  renderGuidedSection();
}

/** Add an L2 or mood chip in the guided flow. */
function addGuidedChip(id, display, level) {
  if (guidedStack.some(s => s.id === id)) return;
  if (guidedStack.length >= 10) return;
  guidedStack.push({ id, display, level });
  chipSearchExecuted = false;
  renderChipsRow();
  updateSearchArrow();
  renderGuidedSection();
}

/** Reset-all × — exits guided mode entirely. */
function resetGuidedMode() {
  chipMode = 'free';
  guidedStack = [];
  chipSearchExecuted = false;
  const input = document.getElementById('explore-search-input');
  if (input) input.value = '';
  renderChipsRow();
  updateSearchArrow();
  renderGuidedSection();
}

/** Silent revert when user starts typing in guided mode. Does NOT clear input. */
function exitGuidedMode() {
  chipMode = 'free';
  guidedStack = [];
  chipSearchExecuted = false;
  renderGuidedSection();
}

// ── Search Results Page (sub-page of Browse) ──────────────────────
function renderSearchResults(data) {
  const { chips, query } = data;
  const el = document.getElementById('page-search-results');
  const chipIds = new Set(chips.map(c => c.id));

  // ── Match exercises (OR logic across chips) ──
  const allExercises = APP_DATA.categories.flatMap(c =>
    c.exercises.map(e => ({ ...e, _catId: c.id, _catTitle: c.title }))
  );
  const exerciseResults = allExercises.filter(ex => {
    const kws = new Set();
    kws.add(ex.category.toLowerCase().replace(/-/g, ' '));
    kws.add(ex.categoryTag.toLowerCase().replace(/-/g, ' '));
    if (ex.tags) {
      (ex.tags.searchKeywords || []).forEach(k => kws.add(k.toLowerCase().replace(/-/g, ' ')));
      (ex.tags.techniqueFamilies || []).forEach(k => kws.add(k.toLowerCase().replace(/-/g, ' ')));
      (ex.tags.toolsRequired || []).forEach(k => kws.add(k.toLowerCase().replace(/-/g, ' ')));
      (ex.tags.learningGoals || []).forEach(k => kws.add(k.toLowerCase().replace(/-/g, ' ')));
      kws.add((ex.tags.skillLevel || '').toLowerCase());
      kws.add((ex.tags.durationBucket || '').toLowerCase());
    }
    for (const chipId of chipIds) {
      for (const kw of kws) {
        if (kw === chipId || kw.includes(chipId)) return true;
      }
    }
    return false;
  });

  // ── Match inspiration items (flat array with taxonomy levels) ──
  const inspoResults = [];
  // Expand chips with synonyms for better recall
  const expandedChipIds = new Set(chipIds);
  for (const cid of chipIds) { getSynonyms(cid).forEach(s => expandedChipIds.add(s)); }

  (Array.isArray(INSPO_DATA) ? INSPO_DATA : []).forEach(item => {
    const m = item.metadata || {};
    const parsed = item._mediumParsed || parseMediumLevels(m.mediumTags);
    const fields = new Set();
    (m.industry || []).forEach(v => fields.add(v.toLowerCase().replace(/-/g, ' ')));
    (m.colorPalette || []).forEach(v => fields.add(v.toLowerCase().replace(/-/g, ' ')));
    (m.subjectMatter || []).forEach(v => fields.add(v.toLowerCase().replace(/-/g, ' ')));
    (m.techniqueVisible || []).forEach(v => fields.add(v.toLowerCase().replace(/-/g, ' ')));
    parsed.all.forEach(v => fields.add(v.toLowerCase()));
    (m.mediumTags || []).forEach(tag => fields.add(tag.toLowerCase()));
    fields.add((item.title || '').toLowerCase());
    fields.add((item.subtitle || '').toLowerCase());

    for (const chipId of expandedChipIds) {
      for (const f of fields) {
        if (f.includes(chipId)) {
          const sectionTitle = parsed.L1[0] || parsed.L0[0] || 'Inspiration';
          inspoResults.push({ ...item, _sectionTitle: sectionTitle });
          return;
        }
      }
    }
  });

  // ── Build HTML ──
  const cat_lookup = {};
  APP_DATA.categories.forEach(c => c.exercises.forEach(e => cat_lookup[e.id] = c));

  const xSvg = '<span class="selected-chip__x"><svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg></span>';
  const chipTagsHtml = chips.map(c =>
    `<button class="search-results__chip pressable" onclick="removeResultsChip('${c.id.replace(/'/g, "\\'")}')">
       ${c.display} ${xSvg}
     </button>`
  ).join('');
  const clearAllHtml = chips.length > 0
    ? '<button class="clear-all-chips pressable" onclick="clearAllResultsChips()">CLEAR ALL</button>'
    : '';

  const totalResults = exerciseResults.length + inspoResults.length;

  // ── "Topics you may enjoy" — personalized recommendations ──
  const recommendedTopics = getRecommendedTopics(chipIds, 8);
  const topicsHtml = recommendedTopics.length > 0 ? `
    <div class="search-results__topics">
      <div class="search-results__topics-title">Topics you may enjoy</div>
      <div class="search-results__topics-scroll">
        ${recommendedTopics.map(t =>
          `<button class="search-results__topic-pill pressable"
             onclick="addRecommendedTopic('${t.id.replace(/'/g, "\\'")}', '${t.display.replace(/'/g, "\\'")}')"
           >${t.display}</button>`
        ).join('')}
      </div>
    </div>` : '';

  const emptyHtml = totalResults === 0 ? `
    <div class="explore-empty">
      <div class="explore-empty__icon">\uD83D\uDD0D</div>
      <div class="explore-empty__title">No results found</div>
      <div class="explore-empty__subtitle">Try different search terms or chips</div>
    </div>` : '';

  // Store results globally for modal and lazy loading
  window._inspoResults = inspoResults;
  window._inspoVisible = 15;

  const savedInspoIds = new Set(getSavedInspo().map(s => s.id));

  // Store chips JSON for drill-down pages
  const chipsJson = JSON.stringify(chips).replace(/'/g, "&#39;").replace(/"/g, '&quot;');

  const firstBatch = inspoResults.slice(0, 15);
  const inspoRemaining = inspoResults.length - 15;

  const inspoHtml = inspoResults.length > 0 ? `
    <div class="search-results__section">
      <div class="search-results__section-header">
        <div class="search-results__section-title">Inspiration (${inspoResults.length})</div>
        <div class="search-results__result-count">${totalResults} result${totalResults !== 1 ? 's' : ''}</div>
      </div>
      <div class="search-results__grid" id="inspo-grid">
        ${firstBatch.map((item, idx) => renderInspoCard(item, idx, savedInspoIds)).join('')}
      </div>
      ${inspoRemaining > 0 ? `
        <button class="search-results__load-more pressable" onclick="loadMoreInspo()">
          View More
        </button>` : ''}
    </div>` : '';

  // Store exercise results globally for drill-down
  window._exerciseResults = exerciseResults;
  window._exerciseCatLookup = cat_lookup;

  const exercisePreview = exerciseResults.slice(0, 8); // Show max 8 inline
  const exercisesHtml = exerciseResults.length > 0 ? `
    <div class="search-results__section search-results__section--exercises">
      <div class="search-results__section-title">Exercises (${exerciseResults.length})</div>
      <div class="search-results__exercise-list">
        ${exercisePreview.map(ex => {
          const cat = cat_lookup[ex.id];
          return `
            <div class="exercise-row pressable" onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })">
              <div class="exercise-row__thumb">${ex.number}</div>
              <div class="exercise-row__content">
                <div class="exercise-row__top">
                  <div>
                    <div class="exercise-row__title">${ex.title}</div>
                    <div class="exercise-row__desc">${ex.category} \u00B7 ${ex.duration}</div>
                  </div>
                  <button class="exercise-row__bookmark pressable" data-id="${ex.id}" onclick="event.stopPropagation(); toggleBookmark('${ex.id}')">
                    ${bookmarks.has(ex.id) ? ICONS.bookmarkFill : ICONS.bookmark}
                  </button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
      ${exerciseResults.length > 8 ? `<button class="search-results__view-all pressable" onclick="navigateTo('page-exercises-all', renderAllExercises)">View all ${exerciseResults.length} exercises</button>` : ''}
    </div>` : '';

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <button class="nav-bar__back pressable" onclick="goBack()">${ICONS.chevronLeft}</button>
        <span class="nav-bar__title">Search Results</span>
      </div>
    </div>
    <div class="grid-container" style="padding-bottom:100px">
      <div class="search-results__header">
        <div class="search-results__chips">${chipTagsHtml}</div>
        ${clearAllHtml}
      </div>
      ${topicsHtml}
      ${emptyHtml}
      ${inspoHtml}
      ${exercisesHtml}
    </div>
  `;
}

// ── Inspo Card Helper ──────────────────────────────────────────
function renderInspoCard(item, idx, savedInspoIds) {
  const isSaved = savedInspoIds.has(item.id);
  return `
    <div class="search-results__inspo-card pressable" onclick="openInspoModal(${idx})">
      <button class="search-results__inspo-bookmark pressable${isSaved ? ' search-results__inspo-bookmark--saved' : ''}"
        data-inspo-id="${item.id}"
        onclick="event.stopPropagation(); toggleInspoSave('${item.id}', '${(item.title || '').replace(/'/g, "\\'")}', '${(item.subtitle || '').replace(/'/g, "\\'")}', '${(item._sectionTitle || '').replace(/'/g, "\\'")}', this, '${(item.imageUrl || '').replace(/'/g, "\\'")}')">
        ${isSaved ? ICONS.bookmarkFill : ICONS.bookmark}
      </button>
      ${item.imageUrl ? `<img src="${safeImgUrl(item.imageUrl)}" alt="${item.title}" loading="lazy" class="search-results__inspo-img" />` : ''}
      <div class="search-results__inspo-overlay">
        <div class="search-results__inspo-title">${item.title}</div>
        <div class="search-results__inspo-subtitle">${item.subtitle}</div>
      </div>
    </div>`;
}

// ── Lazy-load next 15 inspo results ───────────────────────────
function loadMoreInspo() {
  const results = window._inspoResults || [];
  const from = window._inspoVisible || 15;
  const to = from + 15;
  const nextBatch = results.slice(from, to);

  window._inspoVisible = to;

  const grid = document.getElementById('inspo-grid');
  if (grid && nextBatch.length) {
    const savedInspoIds = new Set(getSavedInspo().map(s => s.id));
    grid.insertAdjacentHTML('beforeend',
      nextBatch.map((item, i) => renderInspoCard(item, from + i, savedInspoIds)).join('')
    );
  }

  const btn = document.querySelector('.search-results__load-more');
  if (btn) {
    const remaining = results.length - window._inspoVisible;
    if (remaining <= 0) {
      btn.remove();
    } else {
      btn.textContent = 'View More';
    }
  }
}

// ── Inspiration Bookmark Toggle ────────────────────────────────
function toggleInspoSave(id, title, subtitle, sectionTitle, btnEl, imageUrl) {
  const saved = getSavedInspo();
  const idx = saved.findIndex(s => s.id === id);

  if (idx > -1) {
    saved.splice(idx, 1);
    if (btnEl) {
      btnEl.classList.remove('search-results__inspo-bookmark--saved');
      btnEl.innerHTML = ICONS.bookmark;
    }
  } else {
    saved.unshift({ id, title, subtitle, category: sectionTitle, type: 'inspiration', imageUrl: imageUrl || null, savedAt: Date.now() });
    if (btnEl) {
      btnEl.classList.add('search-results__inspo-bookmark--saved');
      btnEl.innerHTML = ICONS.bookmarkFill;
    }
  }

  localStorage.setItem(SAVED_INSPO_KEY, JSON.stringify(saved));
  invalidateSavedCaches();

  if (document.getElementById('page-catalogue')?.classList.contains('active')) {
    renderCatalogue();
  }
}

// ── Inspiration Lightbox Modal ─────────────────────────────────
function openInspoModal(index) {
  const items = window._inspoResults || [];
  if (!items.length) return;

  let current = index;

  function isSaved(id) {
    return getSavedInspo().some(s => s.id === id);
  }

  function render() {
    const item = items[current];
    if (!item) { closeInspoModal(); return; }
    const saved = isSaved(item.id);

    let modal = document.getElementById('inspo-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'inspo-modal';
      modal.className = 'inspo-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Inspiration viewer');
      // Click backdrop (outside container) to close
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeInspoModal();
        }
      });
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="inspo-modal__container">
        <div class="inspo-modal__header">
          <span></span>
          <button class="inspo-modal__close pressable" onclick="closeInspoModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="inspo-modal__body">
          <button class="inspo-modal__nav inspo-modal__nav--prev" onclick="event.stopPropagation(); navigateInspoModal(-1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="inspo-modal__card">
            <button class="inspo-modal__bookmark pressable${saved ? ' inspo-modal__bookmark--saved' : ''}" onclick="event.stopPropagation(); toggleInspoModalBookmark()">
              ${saved ? ICONS.bookmarkFill : ICONS.bookmark}
            </button>
            ${item.imageUrl ? `<img src="${safeImgUrl(item.imageUrl)}" alt="${item.title}" class="inspo-modal__img" />` : ''}
            <div class="inspo-modal__info">
              <div class="inspo-modal__title">${item.title}</div>
              <div class="inspo-modal__subtitle">${item.subtitle}</div>
            </div>
          </div>
          <button class="inspo-modal__nav inspo-modal__nav--next" onclick="event.stopPropagation(); navigateInspoModal(1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  window._inspoModalCurrent = () => current;
  window._inspoModalRender = render;

  window.toggleInspoModalBookmark = function() {
    const item = items[current];
    if (!item) return;
    const saved = getSavedInspo();
    const sIdx = saved.findIndex(s => s.id === item.id);
    if (sIdx > -1) {
      saved.splice(sIdx, 1);
    } else {
      saved.unshift({ id: item.id, title: item.title, subtitle: item.subtitle, category: item._sectionTitle || '', type: 'inspiration', imageUrl: item.imageUrl || null, savedAt: Date.now() });
    }
    localStorage.setItem(SAVED_INSPO_KEY, JSON.stringify(saved));
    invalidateSavedCaches();
    render();
    // Also update the card bookmark button behind the modal
    const cardBtn = document.querySelector(`.search-results__inspo-bookmark[data-inspo-id="${item.id}"]`);
    if (cardBtn) {
      const nowSaved = getSavedInspo().some(s => s.id === item.id);
      cardBtn.classList.toggle('search-results__inspo-bookmark--saved', nowSaved);
      cardBtn.innerHTML = nowSaved ? ICONS.bookmarkFill : ICONS.bookmark;
    }
    if (document.getElementById('page-catalogue')?.classList.contains('active')) {
      renderCatalogue();
    }
  };

  window.navigateInspoModal = function(dir) {
    const next = current + dir;
    if (next < 0 || next >= items.length) {
      closeInspoModal();
      return;
    }
    current = next;
    render();
  };

  // Keyboard: Escape to close, arrows to navigate, Tab focus trap
  window._inspoModalKeyHandler = function(e) {
    if (e.key === 'Escape') { closeInspoModal(); return; }
    if (e.key === 'ArrowLeft') { window.navigateInspoModal(-1); return; }
    if (e.key === 'ArrowRight') { window.navigateInspoModal(1); return; }
    if (e.key === 'Tab') {
      const m = document.getElementById('inspo-modal');
      if (!m) return;
      const focusable = m.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', window._inspoModalKeyHandler);

  render();
}

function closeInspoModal() {
  const modal = document.getElementById('inspo-modal');
  if (modal) modal.remove();
  if (window._inspoModalKeyHandler) {
    document.removeEventListener('keydown', window._inspoModalKeyHandler);
    window._inspoModalKeyHandler = null;
  }
}

// ── View All Inspiration ───────────────────────────────────────
function renderAllInspo() {
  const el = document.getElementById('page-inspo-all');
  const items = window._inspoResults || [];
  const savedInspoIds = new Set(getSavedInspo().map(s => s.id));

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <button class="nav-bar__back pressable" onclick="goBack()">${ICONS.chevronLeft}</button>
        <span class="nav-bar__title">Inspiration (${items.length})</span>
      </div>
    </div>
    <div class="grid-container" style="padding-bottom:100px">
      <div class="search-results__grid search-results__grid--all">
        ${items.map((item, idx) => {
          const isSaved = savedInspoIds.has(item.id);
          return `
          <div class="search-results__inspo-card pressable" onclick="openInspoModal(${idx})">
            <button class="search-results__inspo-bookmark pressable${isSaved ? ' search-results__inspo-bookmark--saved' : ''}" data-inspo-id="${item.id}" onclick="event.stopPropagation(); toggleInspoSave('${item.id}', '${(item.title || '').replace(/'/g, "\\'")}', '${(item.subtitle || '').replace(/'/g, "\\'")}', '${(item._sectionTitle || '').replace(/'/g, "\\'")}', this, '${(item.imageUrl || '').replace(/'/g, "\\'")}' )">
              ${isSaved ? ICONS.bookmarkFill : ICONS.bookmark}
            </button>
            ${item.imageUrl ? `<img src="${safeImgUrl(item.imageUrl)}" alt="${item.title}" loading="lazy" class="search-results__inspo-img" />` : ''}
            <div class="search-results__inspo-overlay">
              <div class="search-results__inspo-title">${item.title}</div>
              <div class="search-results__inspo-subtitle">${item.subtitle}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ── View All Exercises ─────────────────────────────────────────
function renderAllExercises() {
  const el = document.getElementById('page-exercises-all');
  const exerciseResults = window._exerciseResults || [];
  const cat_lookup = window._exerciseCatLookup || {};

  el.innerHTML = `
    <div class="nav-bar">
      <div class="grid-container">
        <button class="nav-bar__back pressable" onclick="goBack()">${ICONS.chevronLeft}</button>
        <span class="nav-bar__title">Exercises (${exerciseResults.length})</span>
      </div>
    </div>
    <div class="grid-container" style="padding-bottom:100px">
      ${exerciseResults.map(ex => {
        const cat = cat_lookup[ex.id];
        return `
          <div class="exercise-row pressable" onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat?.id || ''}' })">
            <div class="exercise-row__thumb">${ex.number}</div>
            <div class="exercise-row__content">
              <div class="exercise-row__top">
                <div>
                  <div class="exercise-row__title">${ex.title}</div>
                  <div class="exercise-row__desc">${ex.category} \u00B7 ${ex.duration}</div>
                </div>
                <button class="exercise-row__bookmark pressable" data-id="${ex.id}" onclick="event.stopPropagation(); toggleBookmark('${ex.id}')">
                  ${bookmarks.has(ex.id) ? ICONS.bookmarkFill : ICONS.bookmark}
                </button>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;
}

function removeResultsChip(chipId) {
  // Get current nav data
  const current = NAV_STACK[NAV_STACK.length - 1];
  if (!current || !current.data?.chips) return;

  // Remove the chip
  current.data.chips = current.data.chips.filter(c => c.id !== chipId);

  // Also remove from Browse page searchChips so back-nav stays in sync
  searchChips = searchChips.filter(c => c.id !== chipId);

  // If no chips left, go back to Browse
  if (current.data.chips.length === 0) {
    goBack();
    return;
  }

  // Re-render the search results page with updated chips
  renderSearchResults(current.data);
}

function clearAllResultsChips() {
  searchChips = [];
  chipSearchExecuted = false;
  goBack();
}

/**
 * Add a recommended topic pill as a search chip and re-run search.
 * Called when user taps a pill in "Topics you may enjoy".
 */
function addRecommendedTopic(kwId, kwDisplay) {
  const current = NAV_STACK[NAV_STACK.length - 1];
  if (!current || !current.data?.chips) return;

  // Don't add duplicates
  if (current.data.chips.some(c => c.id === kwId)) return;

  // Add to search results chips
  current.data.chips.push({ id: kwId, display: kwDisplay });

  // Also sync to Browse page searchChips for back-nav consistency
  if (!searchChips.some(c => c.id === kwId)) {
    searchChips.push({ id: kwId, display: kwDisplay });
  }

  // Re-render search results with updated chips
  renderSearchResults(current.data);
}

function renderExploreSection(section) {
  const isChipStyle = section.items.length <= 4 && section.id === 'explore-skill';

  if (isChipStyle) {
    return `
      <div class="explore-section" data-section="${section.id}">
        <div class="explore-section__header">
          <span class="explore-section__title">${section.title}</span>
          <span class="explore-section__subtitle">${section.subtitle}</span>
        </div>
        <div class="explore-chips">
          ${section.items.map(item => `
            <button class="explore-chip pressable" data-filter="${item.filterValue}" data-key="${item.filterKey}"
              onclick="toggleExploreFilter('${item.filterValue}', '${item.filterKey}', '${item.label}', '${section.title}')">
              ${item.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="explore-section" data-section="${section.id}">
      <div class="explore-section__header">
        <span class="explore-section__title">${section.title}</span>
        <span class="explore-section__subtitle">${section.subtitle}</span>
      </div>
      <div class="explore-grid">
        ${section.items.map(item => `
          <div class="explore-card pressable" data-filter="${item.filterValue}" data-key="${item.filterKey}"
            onclick="toggleExploreFilter('${item.filterValue}', '${item.filterKey}', '${item.label}', '${section.title}')">
            <span class="explore-card__label">${item.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleExploreFilter(filterValue, filterKey, label, sectionTitle) {
  if (exploreFilters.has(filterValue)) {
    exploreFilters.delete(filterValue);
  } else {
    exploreFilters.set(filterValue, { key: filterKey, label, section: sectionTitle });
  }
  updateExploreUI();
  updateExploreResults();
}

function removeExploreFilter(filterValue) {
  exploreFilters.delete(filterValue);
  updateExploreUI();
  updateExploreResults();
}

function clearAllExploreFilters() {
  exploreFilters.clear();
  const input = document.getElementById('explore-search-input');
  if (input) input.value = '';
  updateExploreUI();
  updateExploreResults();
}

// onExploreSearch removed — replaced by onExploreAutocomplete + chip-based search

function updateExploreUI() {
  // Update explore card/chip active states
  document.querySelectorAll('.explore-card, .explore-chip').forEach(el => {
    el.classList.toggle('active', exploreFilters.has(el.dataset.filter));
  });
  // Sync top filter chips
  document.querySelectorAll('#skill-chips .chip').forEach(chip => {
    chip.classList.toggle('selected', exploreFilters.has(chip.dataset.skill));
  });
  document.querySelectorAll('#technique-chips .chip').forEach(chip => {
    chip.classList.toggle('selected', exploreFilters.has(chip.dataset.technique));
  });
}

function updateExploreResults() {
  const container = document.getElementById('explore-results');
  if (!container) return;

  const input = document.getElementById('explore-search-input');
  const q = (input?.value || '').toLowerCase().trim();
  const hasFilters = exploreFilters.size > 0;

  if (!q && !hasFilters) {
    container.innerHTML = '';
    return;
  }

  // Build all exercises with category reference
  const allExercises = APP_DATA.categories.flatMap(c =>
    c.exercises.map(e => ({ ...e, _catId: c.id, _catTitle: c.title }))
  );

  let results = allExercises;

  // Text search
  if (q) {
    results = results.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.categoryTag.toLowerCase().includes(q) ||
      (e.tags?.searchKeywords || []).some(k => k.toLowerCase().includes(q)) ||
      (e.tags?.techniqueFamilies || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // Apply taxonomy filters
  if (hasFilters) {
    results = results.filter(ex => {
      return Array.from(exploreFilters.entries()).every(([filterValue, { key }]) => {
        switch (key) {
          case 'technique':
            return (ex.tags?.techniqueFamilies || []).includes(filterValue);
          case 'skill':
            return ex.tags?.skillLevel === filterValue;
          case 'category':
          case 'style':
          case 'decade':
          case 'career':
          case 'theme':
            // Match against technique families, category tags, search keywords
            return (ex.tags?.techniqueFamilies || []).some(t => t.includes(filterValue)) ||
                   (ex.tags?.searchKeywords || []).some(k => k.includes(filterValue)) ||
                   ex.categoryTag.toLowerCase().includes(filterValue) ||
                   ex.category.toLowerCase().includes(filterValue);
          default:
            return true;
        }
      });
    });
  }

  // Build active filter tags
  const filterTags = Array.from(exploreFilters.entries()).map(([val, { label }]) =>
    `<button class="explore-filter-tag pressable" onclick="removeExploreFilter('${val}')">
       ${label} <span class="explore-filter-tag__x"><svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg></span>
     </button>`
  ).join('');

  if (results.length === 0) {
    container.innerHTML = `
      <div class="explore-results">
        ${filterTags ? `<div class="explore-active-filters">${filterTags}</div>` : ''}
        <div class="explore-empty">
          <div class="explore-empty__icon">\uD83D\uDD0D</div>
          <div class="explore-empty__title">No matching exercises</div>
          <div class="explore-empty__subtitle">Try different filters or search terms</div>
        </div>
      </div>
    `;
    return;
  }

  const cat_lookup = {};
  APP_DATA.categories.forEach(c => c.exercises.forEach(e => cat_lookup[e.id] = c));

  container.innerHTML = `
    <div class="explore-results">
      <div class="explore-results__header">
        <span class="explore-results__count">${results.length} exercise${results.length !== 1 ? 's' : ''}</span>
        <button class="explore-results__clear pressable" onclick="clearAllExploreFilters()">Clear all</button>
      </div>
      ${filterTags ? `<div class="explore-active-filters">${filterTags}</div>` : ''}
      ${results.map(ex => {
        const cat = cat_lookup[ex.id];
        return `
          <div class="exercise-row pressable" onclick="navigateTo('page-video', renderVideoPlayer, { exerciseId: '${ex.id}', categoryId: '${cat.id}' })">
            <div class="exercise-row__thumb">${ex.number}</div>
            <div class="exercise-row__content">
              <div class="exercise-row__top">
                <div>
                  <div class="exercise-row__title">${ex.title}</div>
                  <div class="exercise-row__desc">${ex.category} \u00B7 ${ex.duration}</div>
                </div>
                <button class="exercise-row__bookmark pressable" data-id="${ex.id}" onclick="event.stopPropagation(); toggleBookmark('${ex.id}')">
                  ${bookmarks.has(ex.id) ? ICONS.bookmarkFill : ICONS.bookmark}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// -- Saved page tab switch (in-page panel swap, no nav stack) ---------
function switchCatalogueTab(tab) {
  currentCatalogueTab = tab;
  document.querySelectorAll('#page-catalogue .settings-tab').forEach(btn => {
    btn.classList.toggle('settings-tab--active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.saved-panel').forEach(panel => {
    panel.classList.toggle('saved-panel--active', panel.dataset.panel === tab);
  });
}

// -- Settings tab switch (crossfade, no skeleton, no nav stack push) --
function switchSettingsTab(pageId, renderFn) {
  closeUserMenu();
  const page = document.getElementById(pageId);
  if (!page || page.classList.contains('active')) return;
  // Render into the hidden target page first — no visual change yet
  renderFn();
  // Swap active atomically in one frame — no blank flash, no fade blink
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'page-back', 'settings-tab-enter'));
  page.classList.add('active');
  updateBottomNavActive(pageId);
  window.scrollTo(0, 0);
}

// -- Settings shared nav (Account + Preferences) ---------------
function settingsNavHTML(activeTab) {
  const backSVG = `<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 1 1 7 7 13"/></svg>`;

  return `
    <nav class="settings-nav">
      <button class="settings-nav__back pressable" onclick="handleBottomNav('home')" aria-label="Back to home">
        ${backSVG}
      </button>
      <div class="settings-tabs" role="tablist">
        <div class="settings-tabs__inner">
          <button class="settings-tab pressable${activeTab === 'account' ? ' settings-tab--active' : ''}"
                  role="tab" aria-selected="${activeTab === 'account'}"
                  onclick="switchSettingsTab('page-account', renderAccount)">Account</button>
          <button class="settings-tab pressable${activeTab === 'preferences' ? ' settings-tab--active' : ''}"
                  role="tab" aria-selected="${activeTab === 'preferences'}"
                  onclick="switchSettingsTab('page-preferences', renderPreferences)">Preferences</button>
        </div>
      </div>
      <span class="settings-nav__spacer"></span>
    </nav>`;
}

// -- Account page ----------------------------------------------
function renderAccount() {
  const page = document.getElementById('page-account');
  if (!page || !currentUser) return;

  const chevron = `<svg class="settings-row__chevron" width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 1 6 6 1 11"/></svg>`;

  page.innerHTML = `
    <div class="settings-page">
      ${settingsNavHTML('account')}

      <div class="profile-section">
        <button class="profile-avatar-btn pressable" aria-label="Edit profile photo">
          <div class="profile-avatar" style="background:${currentUser.photoColor}">${currentUser.photoInitials}</div>
        </button>
        <div class="profile-name">${currentUser.name}</div>
      </div>

      <div class="settings-group">
        <div class="settings-group__label">Profile</div>
        <div class="settings-card">
          <button class="settings-row pressable">
            <span class="settings-row__label">Name</span>
            <span class="settings-row__value">${currentUser.name}</span>
            ${chevron}
          </button>
          <button class="settings-row pressable">
            <span class="settings-row__label">Email</span>
            <span class="settings-row__value">${currentUser.email}</span>
            ${chevron}
          </button>
          <button class="settings-row pressable">
            <span class="settings-row__label">Change Password</span>
            ${chevron}
          </button>
          <button class="settings-row pressable">
            <span class="settings-row__label">Reminder Time</span>
            <span class="settings-row__value">9:00 AM</span>
            ${chevron}
          </button>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group__label">Account Settings</div>
        <div class="settings-card">
          <button class="settings-row pressable">
            <span class="settings-row__label">Notification Preferences</span>
            ${chevron}
          </button>
          <button class="settings-row pressable">
            <span class="settings-row__label">Manage Subscription</span>
            ${chevron}
          </button>
        </div>
      </div>

      <div class="settings-signout">
        <button class="settings-signout-btn pressable" onclick="signOut()">Sign Out</button>
      </div>
    </div>
  `;
}

// -- Preferences page ------------------------------------------
const PREFS = {
  artStyles:          ['Character Design', 'Portrait'],
  careerGoals:        ['Freelance Illustrator', 'Concept Artist'],
  skillLevel:         'learning',
  practiceTime:       '5',
  tailoredExercises:  true,
  anatomyFundamentals: true,
  perspectiveDrills:  false,
};

function togglePref(key, value) {
  const idx = PREFS[key].indexOf(value);
  if (idx >= 0) PREFS[key].splice(idx, 1);
  else          PREFS[key].push(value);
  renderPreferences();
}

function renderPreferences() {
  const page = document.getElementById('page-preferences');
  if (!page) return;

  const allArtStyles   = ['Character Design', 'Environment Design', 'Vehicle Design', 'Creature Design', 'Digital Painting', 'Concept Art', 'Comic Art', 'Portrait', 'Anime', 'Sci-Fi Art', '3D Art', 'Traditional'];
  const allCareerGoals = ['Freelance Illustrator', 'Concept Artist', 'Animator', 'Game Artist', 'Fine Artist', 'Comic Artist', 'Automotive Designer', 'VFX Artist'];
  const skillLevels    = [
    { value: 'beginner', label: 'Just Starting'          },
    { value: 'learning', label: 'Learning Consistently'  },
    { value: 'pro',      label: 'Working Pro'            },
  ];
  const practiceTimes  = [
    { value: '3',  label: '3 Minutes'  },
    { value: '5',  label: '5 Minutes'  },
    { value: '10', label: '10 Minutes' },
  ];

  const toggle = (key, label, checked) => `
    <div class="pref-toggle-row">
      <span class="pref-toggle-row__label">${label}</span>
      <label class="toggle-switch">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="PREFS.${key}=this.checked">
        <span class="toggle-switch__track"></span>
        <span class="toggle-switch__thumb"></span>
      </label>
    </div>`;

  page.innerHTML = `
    <div class="settings-page">
      ${settingsNavHTML('preferences')}

      <div style="height:24px"></div>

      <div class="pref-section">
        <div class="pref-section__header">
          <span class="pref-section__title">Art Style Inspiration</span>
        </div>
        <div class="pref-tags">
          ${allArtStyles.map(s => `<button class="pref-tag pressable${PREFS.artStyles.includes(s) ? ' selected' : ''}" onclick="togglePref('artStyles','${s}')">${s}</button>`).join('')}
          <button class="pref-tag more pressable">More...</button>
        </div>
      </div>

      <div class="pref-section">
        <div class="pref-section__header">
          <span class="pref-section__title">Creative Career Goals</span>
          <button class="pref-section__edit pressable">Edit</button>
        </div>
        <div class="pref-tags">
          ${allCareerGoals.map(g => `<button class="pref-tag pressable${PREFS.careerGoals.includes(g) ? ' selected' : ''}" onclick="togglePref('careerGoals','${g}')">${g}</button>`).join('')}
        </div>
      </div>

      <div class="pref-section">
        <div class="pref-section__header">
          <span class="pref-section__title">Skill Level</span>
        </div>
        <div class="pref-radios">
          ${skillLevels.map(sl => `
            <label class="pref-radio pressable">
              <input type="radio" name="skillLevel" value="${sl.value}" ${PREFS.skillLevel === sl.value ? 'checked' : ''} onchange="PREFS.skillLevel='${sl.value}'">
              <span class="pref-radio__label">${sl.label}</span>
            </label>`).join('')}
        </div>
      </div>

      <div class="pref-section">
        <div class="pref-section__header">
          <span class="pref-section__title">Daily Practice Time</span>
        </div>
        <div class="pref-radios">
          ${practiceTimes.map(pt => `
            <label class="pref-radio pressable">
              <input type="radio" name="practiceTime" value="${pt.value}" ${PREFS.practiceTime === pt.value ? 'checked' : ''} onchange="PREFS.practiceTime='${pt.value}'">
              <span class="pref-radio__label">${pt.label}</span>
            </label>`).join('')}
        </div>
      </div>

      <div class="pref-section">
        <div class="pref-section__header">
          <span class="pref-section__title">Exercise Types</span>
        </div>
        <div class="pref-toggles">
          ${toggle('tailoredExercises',   'Tailored Exercises',   PREFS.tailoredExercises)}
          ${toggle('anatomyFundamentals', 'Anatomy Fundamentals', PREFS.anatomyFundamentals)}
          ${toggle('perspectiveDrills',   'Perspective Drills',   PREFS.perspectiveDrills)}
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}

// -- Helpers ---------------------------------------------------
function parseDuration(durationStr) {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 180;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// -- Init ------------------------------------------------------
let _authBootDone = false; // prevents double-boot on rapid state changes

document.addEventListener('DOMContentLoaded', () => {
  // Hydrate in-memory bookmark Set from localStorage so detail/list pages stay in sync
  getSavedAssignments().forEach(s => bookmarks.add(s.id));

  // Firebase resolves the persisted session on first call, then fires on every
  // sign-in / sign-out. We use a single persistent listener for the full session.
  fbAuth.onAuthStateChanged(async (fbUser) => {
    if (fbUser && !currentUser) {
      // Sign-in: load Firestore profile, then boot or re-render home
      await loadUserProfile(fbUser.uid, fbUser.email);
      if (!_authBootDone) {
        _authBootDone = true;
        await loadData();           // First load — fetches exercises.json + renders home
      } else {
        // App already booted (e.g. sign-in after browsing as guest)
        renderGlobalAvatar();
        await bootAuthenticatedApp();
      }
    } else if (!fbUser && _authBootDone) {
      // Sign-out: handled by signOut() which already resets the UI
      _authBootDone = false;
    } else if (!fbUser && !_authBootDone) {
      // Cold load with no session — load data then show unauthenticated home
      _authBootDone = true;
      // Fetch exercise + inspiration data so For You feed works for guests
      await loadAppData();
      handleBottomNav('home');
    }
  });
});
