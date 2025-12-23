// 보유 기술 & 언어 능력 컴포넌트

type Props = {
  skills?: string[];
  languages?: string[];
};

export default function SkillsLanguages({ skills, languages }: Props) {
  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">보유 기술</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills && skills.length > 0 ? (
          skills.map((skill) => (
            <span key={skill} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">기술을 추가해주세요</p>
        )}
      </div>

      <h4 className="text-sm font-semibold text-gray-900 mb-2 mt-6">언어 능력</h4>
      <div className="space-y-2">
        {languages && languages.length > 0 ? (
          languages.map((lang) => (
            <div key={lang} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{lang}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                유창함
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">언어를 추가해주세요</p>
        )}
      </div>
    </div>
  );
}
