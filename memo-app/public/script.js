const memoInput = document.getElementById('memoInput');
const statusMessage = document.getElementById('statusMessage');
const memoListWrapper = document.getElementById('memoListWrapper');
const memoList = document.getElementById('memoList');
const deleteInstruction = document.getElementById('deleteInstruction');

const API_URL = '/api/memo';
let isDeleteMode = false;

// Helper function to display temporary status messages
function showStatus(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.className = `status-message status-${type} show`;
    
    // Auto-hide the message after 3 seconds
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

// 1. Save Memo
async function saveMemo() {
    const content = memoInput.value.trim();
    
    if (!content) {
        showStatus('저장할 내용을 입력해주세요.', 'error');
        memoInput.style.transform = 'translateX(5px)';
        setTimeout(() => memoInput.style.transform = 'translateX(-5px)', 50);
        setTimeout(() => memoInput.style.transform = 'translateX(0)', 100);
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            showStatus('메모가 성공적으로 저장되었습니다! 💾', 'success');
            memoInput.value = ''; // 지우기 처리 (요구사항)
            
            // Eğer liste açıksa güncelle
            if (!memoListWrapper.classList.contains('hidden')) {
                loadMemoList(false); // sessiz yükleme
            }
        } else {
            showStatus('메모 저장에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('Error saving memo:', error);
        showStatus('저장 중 네트워크 오류가 발생했습니다.', 'error');
    }
}

// 2. Load Memo List
async function loadMemoList(showMsg = true) {
    isDeleteMode = false;
    deleteInstruction.classList.add('hidden');
    memoList.classList.remove('delete-mode');
    
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            renderMemoList(data.memos);
            memoListWrapper.classList.remove('hidden');
            if(showMsg) showStatus('메모를 불러왔습니다! 📂', 'info');
        } else {
            if(showMsg) showStatus('메모를 불러오는데 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('Error loading memos:', error);
        if(showMsg) showStatus('네트워크 오류가 발생했습니다.', 'error');
    }
}

// Render the list of memos to the DOM
function renderMemoList(memos) {
    memoList.innerHTML = '';
    
    if (!memos || memos.length === 0) {
        memoList.innerHTML = '<p style="text-align:center; color:#718096; font-size:14px; padding:10px;">저장된 메모가 없습니다.</p>';
        return;
    }

    memos.forEach(memo => {
        const div = document.createElement('div');
        div.className = 'memo-item';
        
        // 포맷팅된 날짜
        const date = new Date(memo.created_at).toLocaleString();
        
        div.innerHTML = `
            <div class="memo-content">${memo.content.replace(/\n/g, '<br>')}</div>
            <div class="memo-date">${date}</div>
        `;

        // 아이템 클릭 이벤트 핸들러
        div.onclick = () => handleMemoClick(memo.id, memo.content);
        
        memoList.appendChild(div);
    });
}

// Handle clicking on a memo item
function handleMemoClick(id, content) {
    if (isDeleteMode) {
        deleteMemoById(id);
    } else {
        // 읽기 모드: 텍스트 영역으로 내용 복사
        memoInput.value = content;
        showStatus('메모가 입력란에 복사되었습니다! ✍️', 'success');
        
        // 피드백 애니메이션
        memoInput.style.transform = 'scale(0.98)';
        setTimeout(() => memoInput.style.transform = 'scale(1)', 150);
    }
}

// 3. Toggle Delete Mode & Load List
async function toggleDeleteMode() {
    isDeleteMode = true;
    memoListWrapper.classList.remove('hidden');
    
    // 리스트를 먼저 최신으로 불러옴
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            renderMemoList(data.memos);
            
            // 삭제 모드 UI 활성화
            memoList.classList.add('delete-mode');
            deleteInstruction.classList.remove('hidden');
            showStatus('아래에서 삭제할 메모를 클릭하세요. 🗑️', 'info');
            
        } else {
            showStatus('삭제할 메모 목록을 불러오는데 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('Error in delete mode:', error);
    }
}

// Delete specific memo by ID
async function deleteMemoById(id) {
    if (!confirm('이 메모를 정말 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showStatus('메모가 완전히 삭제되었습니다. 🗑️', 'success');
            // 삭제 후 리스트 새로고침
            loadMemoList(false);
            
            // 만약 현재 입력창에 있던 내용과 같다면 비워줌 (선택사항)
            // memoInput.value = '';
        } else {
            showStatus('메모 삭제에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('Error deleting memo:', error);
        showStatus('네트워크 오류가 발생했습니다.', 'error');
    }
}
