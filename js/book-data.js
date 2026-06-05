// ==========================================
// BOOK DATA
// ==========================================
const library = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        color: "linear-gradient(145deg, #1a3a4a, #0d2030)",
        icon: "🥂",
        progress: 65,
        chapters: [
            {
                title: "Chapter 1",
                subtitle: "In my younger and more vulnerable years",
                pages: [
                    `<p class="drop-cap">In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.</p>
                    <p>"Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."</p>
                    <p>He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.</p>
                    <p>The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that when I went to college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.</p>`,
                    `<p>Most of the big shore places were closed now and there were hardly any lights except the shadowy, moving glow of a ferryboat across the Sound. And as the moon rose higher the inessential houses began to melt away until gradually I became aware of the old island here that flowered once for Dutch sailors' eyes—a fresh, green breast of the new world.</p>
                    <p>Its vanished trees, the trees that had made way for Gatsby's house, had once pandered in whispers to the last and greatest of all human dreams; for a transitory enchanted moment man must have held his breath in the presence of this continent, compelled into an aesthetic contemplation he neither understood nor desired, face to face for the last time in history with something commensurate to his capacity for wonder.</p>
                    <div class="book-quote">"So we beat on, boats against the current, borne back ceaselessly into the past."<cite>— F. Scott Fitzgerald</cite></div>`,
                    `<p>There was music from my neighbor's house through the summer nights. In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars.</p>
                    <p>At high tide in the afternoon I watched his guests diving from the tower of his raft, or taking the sun on the hot sand of his beach while his two motor-boats slit the waters of the Sound, drawing aquaplanes over cataracts of foam.</p>
                    <p>On week-ends his Rolls-Royce became an omnibus, bearing parties to and from the city between nine in the morning and long past midnight, while his station wagon scampered like a brisk yellow bug to meet all trains.</p>
                    <p>And on Mondays eight servants, including an extra gardener, toiled all day with mops and scrubbing-brushes and hammers and garden-shears, repairing the ravages of the night before.</p>`
                ]
            },
            {
                title: "Chapter 2",
                subtitle: "About halfway between West Egg and New York",
                pages: [
                    `<p class="drop-cap">About halfway between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land.</p>
                    <p>This is a valley of ashes—a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens; where ashes take the forms of houses and chimneys and rising smoke and, finally, with a transcendent effort, of men who move dimly and already crumbling through the powdery air.</p>
                    <p>Occasionally a line of gray cars crawls along an invisible track, gives out a ghastly creak, and comes to rest, and immediately the ash-gray men swarm up with leaden spades and stir up an impenetrable cloud, which screens their obscure operations from your sight.</p>`,
                    `<p>But above the gray land and the spasms of bleak dust which drift endlessly over it, you perceive, after a moment, the eyes of Doctor T. J. Eckleburg.</p>
                    <p>The eyes of Doctor T. J. Eckleburg are blue and gigantic—their retinas are one yard high. They look out of no face, but, instead, from a pair of enormous yellow spectacles which pass over a nonexistent nose.</p>
                    <div class="book-quote">"The eyes of Doctor T. J. Eckleburg are blue and gigantic — their retinas are one yard high. They look out of no face, but, instead, from a pair of enormous yellow spectacles which pass over a nonexistent nose."<cite>— F. Scott Fitzgerald</cite></div>`,
                    `<p>His wife, Catherine, was some time I spent at the house of Tom Buchanan. She was a slender, small-breasted woman, with an erect carriage, which she accentuated by throwing her body backward at the shoulders like a young cadet.</p>
                    <p>Her gray, strained face had no trace of makeup that I could see, but there was an intensity in her expression that suggested she was guarding something precious.</p>
                    <p>She looked at me with interest but without curiosity, as if I were a question she had been expecting. I felt the weight of her gaze and looked away, toward the window where the ash-gray landscape stretched endlessly.</p>`
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        color: "linear-gradient(145deg, #4a2d3e, #2d1a28)",
        icon: "💐",
        progress: 32,
        chapters: [
            {
                title: "Chapter 1",
                subtitle: "It is a truth universally acknowledged",
                pages: [
                    `<p class="drop-cap">It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p>
                    <p>However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.</p>
                    <p>"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"</p>
                    <p>Mr. Bennet replied that he had not.</p>
                    <p>"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."</p>`,
                    `<p>Mr. Bennet made no answer.</p>
                    <p>"Do you not want to know who has taken it?" cried his wife impatiently.</p>
                    <p>"You want to tell me, and I have no objection to hearing it."</p>
                    <p>This was invitation enough.</p>
                    <p>"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on a chaise and four to see the place, and was so much delighted with it that he agreed to take it immediately."</p>
                    <div class="book-quote">"It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."<cite>— Jane Austen</cite></div>`,
                    `<p>"A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"</p>
                    <p>"How so? How can it affect them?"</p>
                    <p>"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."</p>
                    <p>"Is that his design in settling here?"</p>
                    <p>"Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes."</p>`
                ]
            }
        ]
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        color: "linear-gradient(145deg, #3a1a1a, #250d0d)",
        icon: "👁",
        progress: 88,
        chapters: [
            {
                title: "Part One",
                subtitle: "It was a bright cold day in April",
                pages: [
                    `<p class="drop-cap">It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.</p>
                    <p>The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.</p>
                    <div class="book-quote">"BIG BROTHER IS WATCHING YOU."<cite>— The标语 of Oceania</cite></div>`,
                    `<p>Winston was a small of frame and frail build, with fair hair and a face that was naturally sanguine, and roughened by coarse soap and blunt razor blades. His cellars were dimly lit, and the telescreen emitted its peculiar wartime sound, a metallic crackle.</p>
                    <p>He had a thick collagen-bound notebook lying open on his desk, and a large uncouth pen resting beside it. The pen was an ancient instrument, a relic from before the Revolution, which he had bought in a junk shop.</p>
                    <p>He sat for a moment looking at the blank page. Then he began to write, in a small neat hand, the date: April 4th, 1984.</p>`,
                    `<p>The Thought Police would get him just the same. He had committed—would still be committing, even if he wrote the diary—the essential crime that contained all others in itself.</p>
                    <p>Thoughtcrime, they called it. Thoughtcrime was not a thing that could be concealed for ever. You might dodge successfully for a while, even for years, but sooner or later they were bound to get you.</p>
                    <p>It was always at night—the arrests invariably happened at night. The sudden jerk out of sleep, the rough hand gripping your shoulder, the lights glaring in your eyes, the ring of hard faces round the bed.</p>`
                ]
            }
        ]
    },
    {
        id: 4,
        title: "The Alchemist",
        author: "Paulo Coelho",
        color: "linear-gradient(145deg, #4a3e1a, #30280d)",
        icon: "🌟",
        progress: 0,
        chapters: [
            {
                title: "Part One",
                subtitle: "The boy's name was Santiago",
                pages: [
                    `<p class="drop-cap">The boy's name was Santiago. Dusk was falling as the boy arrived with his herd at an abandoned church. The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood.</p>
                    <p>He decided to spend the night there. He saw to it that all the sheep entered through the ruined gate, and then laid some planks across it to prevent the flock from wandering away during the night.</p>
                    <p>There were no wolves in the region, but there had been one attack in the previous night, and he felt it advisable to take precautions. After supping from his sack of provisions, he lay down under the sycamore tree.</p>`,
                    `<p>He was awakened in the middle of the night by a sound. But before he could jump to his feet, he saw that an approaching figure was holding a lantern. It was an old man dressed in black, and he was leading a lamb.</p>
                    <p>"Where are you going?" the boy asked.</p>
                    <p>"I am going to see the boy who tends the sheep," the old man replied. "He sleeps in this church."</p>
                    <div class="book-quote">"When you want something, all the universe conspires in helping you to achieve it."<cite>— Paulo Coelho</cite></div>`,
                    `<p>The boy recognized the old man as Melchizedek, the king of Salem. He was a wise man who lived in the desert and knew the secrets of the world.</p>
                    <p>"I have come to teach you about the Personal Legend," said Melchizedek. "It is what you have always wanted to accomplish. Everyone, when they are young, knows what their Personal Legend is."</p>
                    <p>"It's the possibility of having a dream come true that makes life interesting," he added, as he opened his hands and revealed a stone that seemed to contain a small piece of light.</p>`
                ]
            }
        ]
    },
    {
        id: 5,
        title: "Dune",
        author: "Frank Herbert",
        color: "linear-gradient(145deg, #4a3520, #2d200d)",
        icon: "🏜",
        progress: 45,
        chapters: [
            {
                title: "Chapter 1",
                subtitle: "A beginning is the time for taking the most delicate care",
                pages: [
                    `<p class="drop-cap">A beginning is the time for taking the most delicate care that the balances are correct. This every sister of the Bene Gesserit knows. To begin your study of the life of Muad'Dib, then take care that you first place him in his time: born in the 57th year of the Padishah Emperor, Shaddam IV.</p>
                    <p>Think much of your brother Paul, the Duke's son. He is your Prince, remember that. He will need your loyalty, and he'll need your strength. You are his sister, and you must help him.</p>
                    <p>The Duke Leto Atreides, the boy's father, had arrived on Arrakis the week before, taking over from the Harkonnens who had ruled the desert planet for eighty years. It was a plum assignment, and also a dangerous one.</p>`,
                    `<p>"I must not fear," Paul whispered. "Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me."</p>
                    <p>"And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain."</p>
                    <div class="book-quote">"I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration."<cite>— Frank Herbert</cite></div>`,
                    `<p>The desert planet Arrakis was a place of terrible beauty. The sand dunes stretched endlessly toward every horizon, their crests sculpted by winds that never ceased.</p>
                    <p>In the shade of a rocky overhang, a family of Fremen watched the approach of the new rulers. Their blue-within-blue eyes scanned the landing field with practiced efficiency.</p>
                    <p>They had waited long for this moment. The prophecy spoke of one who would come, a boy from the outer world, who would lead them to paradise.</p>`
                ]
            }
        ]
    }
];
